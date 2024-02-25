import { ClientType } from '../constants/client-type.constant';
import { ClientConnectionInfo } from '../models/ClientConnectionInfo';

const isPresenter = (clientType: string, clientRoomId: string, roomId: string) => {
  if (clientType === ClientType.PRESENTER && clientRoomId === roomId) {
    return true;
  }
  // TODO: 추후 클라이언트로 에러처리 필요
  console.log('해당 발표자가 존재하지 않습니다.');
  return false;
};

const isParticipant = (clientType: string, clientRoomId: string, roomId: string) => {
  if (clientType === ClientType.STUDENT && clientRoomId === roomId) {
    return true;
  }
  // TODO: 추후 클라이언트로 에러처리 필요
  console.log('해당 참여자가 존재하지 않습니다.');
  return false;
};

const isGuest = (clientType: string, clientRoomId: string, roomId: string) => {
  if (clientType === ClientType.GUEST && clientRoomId === roomId) {
    return true;
  }
  // TODO: 추후 클라이언트로 에러처리 필요
  console.log('해당 게스트가 존재하지 않습니다.');
  return false;
};

const isNotEqualPresenterEmail = (email: string, roomInfo: Record<string, string>): boolean => {
  if (Object.keys(roomInfo).length > 0 && roomInfo.presenterEmail !== email) {
    console.log('이미 존재하는 강의실입니다.');
    return true;
  }
  return false;
};

const isParticipatingClient = (
  clientInfo: Record<string, string>,
  clientConnectionInfo: ClientConnectionInfo | undefined,
  roomId: string
) => {
  if (clientInfo && clientConnectionInfo && roomId) {
    return true;
  }
  // TODO: 추후 클라이언트로 에러처리 필요
  console.log('잘못된 요청입니다.');
  return false;
};

export { isPresenter, isParticipant, isGuest, isNotEqualPresenterEmail, isParticipatingClient };