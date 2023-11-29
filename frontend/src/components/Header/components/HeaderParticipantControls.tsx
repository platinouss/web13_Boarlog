import { useState, useRef, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import VolumeMeter from "./VolumeMeter";
import StopIcon from "@/assets/svgs/stop.svg?react";
import MicOnIcon from "@/assets/svgs/micOn.svg?react";
import MicOffIcon from "@/assets/svgs/micOff.svg?react";
import SmallButton from "@/components/SmallButton/SmallButton";
import Modal from "@/components/Modal/Modal";
import { useToast } from "@/components/Toast/useToast";

import selectedSpeakerState from "./stateSelectedSpeaker";
import speakerVolmeState from "./stateSpeakerVolme";

const HeaderParticipantControls = () => {
  const [isSpeakerOn, setisSpeakerOn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [micVolume, setMicVolume] = useState<number>(0);

  const [didMount, setDidMount] = useState(false);

  const selectedSpeaker = useRecoilValue(selectedSpeakerState);
  const SpeakerVolume = useRecoilValue(speakerVolmeState);
  const setSpeakerVolume = useSetRecoilState(speakerVolmeState);

  const timerIdRef = useRef<number | null>(null); // 경과 시간 표시 타이머 id
  const onFrameIdRef = useRef<number | null>(null); // 마이크 볼륨 측정 타이머 id
  const socketRef = useRef<Socket>();
  const pcRef = useRef<RTCPeerConnection>();
  const mediaStreamRef = useRef<MediaStream>();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const speakerVolumeRef = useRef<number>(0);
  const prevSpeakerVolumeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const navigate = useNavigate();
  const showToast = useToast();
  const MEDIA_SERVER_URL = "http://localhost:3000/enter-room";
  const pc_config = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"]
      },
      {
        urls: import.meta.env.VITE_TURN_URL as string,
        username: import.meta.env.VITE_TURN_USERNAME as string,
        credential: import.meta.env.VITE_TURN_PASSWORD as string
      }
    ]
  };

  useEffect(() => {
    setDidMount(true);
  }, []);
  useEffect(() => {
    if (didMount) {
      enterLecture();
    }
  }, [didMount]);

  useEffect(() => {
    speakerVolumeRef.current = SpeakerVolume;
  }, [SpeakerVolume]);
  useEffect(() => {
    if (!audioContextRef.current) return;
    (audioContextRef.current as any).setSinkId(selectedSpeaker);
  }, [selectedSpeaker]);

  const enterLecture = async () => {
    await initConnection();

    await createStudentOffer();
    await setServerAnswer();
    showToast({ message: "음소거 해제 후 소리를 들을 수 있습니다", type: "alert" });
  };

  const leaveLecture = () => {
    setElapsedTime(0);

    if (timerIdRef.current) clearInterval(timerIdRef.current); // 경과 시간 표시 타이머 중지
    if (onFrameIdRef.current) window.cancelAnimationFrame(onFrameIdRef.current); // 마이크 볼륨 측정 중지
    if (socketRef.current) socketRef.current.disconnect(); // 소켓 연결 해제
    if (pcRef.current) pcRef.current.close(); // RTCPeerConnection 해제
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop()); // 미디어 트랙 중지

    setIsModalOpen(false);
    navigate("/");
  };

  const initConnection = async () => {
    try {
      socketRef.current = io(MEDIA_SERVER_URL);
      pcRef.current = new RTCPeerConnection(pc_config);
      const stream = new MediaStream();
      mediaStreamRef.current = stream;

      if (!pcRef.current) return;
      pcRef.current.ontrack = (event) => {
        if (!mediaStreamRef.current || !localAudioRef.current) return;
        if (event.track.kind === "audio") {
          mediaStreamRef.current.addTrack(event.track);
          localAudioRef.current.srcObject = mediaStreamRef.current;
        }
      };
    } catch (e) {
      console.error("연결 에러", e);
    }
  };

  function getStudentCandidate() {
    if (!pcRef.current) return;
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        if (!socketRef.current) return;
        socketRef.current.emit("studentCandidate", {
          candidate: e.candidate,
          studentSocketId: socketRef.current.id
        });
      }
    };
  }

  async function createStudentOffer() {
    try {
      if (!pcRef.current || !socketRef.current) return;
      const SDP = await pcRef.current.createOffer({
        offerToReceiveAudio: true
      });
      socketRef.current.emit("studentOffer", {
        socketId: socketRef.current.id,
        SDP: SDP
      });

      pcRef.current.setLocalDescription(SDP);
      getStudentCandidate();
    } catch (e) {
      console.log(e);
    }
  }

  async function setServerAnswer() {
    if (!socketRef.current) return;
    socketRef.current.on(`${socketRef.current.id}-serverAnswer`, (data) => {
      if (!pcRef.current) return;
      pcRef.current.setRemoteDescription(data.SDP);
    });
    socketRef.current.on(`${socketRef.current.id}-serverCandidate`, (data) => {
      if (!pcRef.current) return;
      pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    });
  }

  const startAnalyse = () => {
    if (!mediaStreamRef.current) return;
    audioContextRef.current = new AudioContext();
    const analyser = audioContextRef.current.createAnalyser();
    const destination = audioContextRef.current.destination;
    const mediaStreamAudioSourceNode = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);

    const gainNode = audioContextRef.current.createGain();
    mediaStreamAudioSourceNode.connect(gainNode);
    gainNode.connect(analyser);
    gainNode.connect(destination);

    const pcmData = new Float32Array(analyser.fftSize);

    const onFrame = () => {
      gainNode.gain.value = speakerVolumeRef.current;
      analyser.getFloatTimeDomainData(pcmData);
      let sum = 0.0;
      for (const amplitude of pcmData) {
        sum += amplitude * amplitude;
      }
      const rms = Math.sqrt(sum / pcmData.length);
      const normalizedVolume = Math.min(1, rms / 0.5);
      setMicVolume(normalizedVolume);
      onFrameIdRef.current = window.requestAnimationFrame(onFrame);
    };
    onFrameIdRef.current = window.requestAnimationFrame(onFrame);
  };

  const mute = () => {
    if (!onFrameIdRef.current) {
      // 최초 연결 후 음소거 해제
      startAnalyse();
      setisSpeakerOn(true);
      showToast({ message: "음소거가 해제되었습니다", type: "success" });
    } else if (isSpeakerOn) {
      prevSpeakerVolumeRef.current = speakerVolumeRef.current;
      setSpeakerVolume(0);
      setisSpeakerOn(false);
      showToast({ message: "음소거 되었습니다", type: "alert" });
    } else {
      setSpeakerVolume(prevSpeakerVolumeRef.current);
      setisSpeakerOn(true);
      showToast({ message: "음소거가 해제되었습니다", type: "success" });
    }
  };

  return (
    <>
      <div className="flex gap-2 fixed left-1/2 -translate-x-1/2">
        <VolumeMeter micVolume={micVolume} />
        <p className="semibold-20 text-boarlog-100">
          {Math.floor(elapsedTime / 60)
            .toString()
            .padStart(2, "0")}
          :{(elapsedTime % 60).toString().padStart(2, "0")}
        </p>
      </div>

      <SmallButton className={`text-grayscale-white bg-alert-100`} onClick={() => setIsModalOpen(true)}>
        <StopIcon className="w-5 h-5 fill-grayscale-white" />
        강의 나가기
      </SmallButton>
      <SmallButton className={`text-grayscale-white ${isSpeakerOn ? "bg-boarlog-100" : "bg-alert-100"}`} onClick={mute}>
        {isSpeakerOn ? (
          <MicOnIcon className="w-5 h-5 fill-grayscale-white" />
        ) : (
          <MicOffIcon className="w-5 h-5 fill-grayscale-white" />
        )}
      </SmallButton>
      <Modal
        modalText="강의를 나가시겠습니까?"
        cancelText="취소"
        confirmText="강의 나가기"
        cancelButtonStyle="black"
        confirmButtonStyle="red"
        confirmClick={leaveLecture}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <audio id="localAudio" playsInline autoPlay muted ref={localAudioRef}></audio>
    </>
  );
};

export default HeaderParticipantControls;