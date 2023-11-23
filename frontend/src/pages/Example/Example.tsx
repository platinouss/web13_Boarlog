import { useState } from "react";
import Header from "@/components/Header/Header";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import { useToast } from "@/components/Toast/useToast";

const Example = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showToast = useToast();

  return (
    <>
      <h1 className="semibold-32 ml-3 mt-3">Common Components Test Page</h1>
      <p className="semibold-16 ml-3 mt-2 mb-3 text-grayscale-darkgray">
        해당 페이지는 공용 컴포넌트 테스트 페이지입니다. 여기를 참고하여 개발을 진행해주세요.
      </p>
      <hr className="mt-3" />

      <h2 className="semibold-32 ml-3 mt-3">Header Component</h2>
      <p className="semibold-16 ml-3 mt-2 mb-3 text-grayscale-darkgray">
        헤더 컴포넌트입니다. 5가지 type으로 페이지별로 쉽게 활용이 가능하도록 구성하였습니다. <br />
        강의 코드 버튼과 강의 참여자의 경우는 아직 개발되지 않았습니다.
      </p>

      <h3 className="semibold-20 ml-3 mt-3">type="login"</h3>
      <Header type="login" />

      <h3 className="semibold-20 ml-3 mt-3">type="main"</h3>
      <Header type="main" />

      <h3 className="semibold-20 ml-3 mt-3">type="instructor"</h3>
      <Header type="instructor" />

      <hr className="mt-3" />

      <h2 className="semibold-32 ml-3 mt-3">Button Component</h2>
      <p className="semibold-16 ml-3 mt-2 mb-3 text-grayscale-darkgray">
        버튼 컴포넌트입니다. 3가지 type으로 나누어 활용할 수 있습니다. 4가지 컬러 타입이 존재합니다.
      </p>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">type="fit"</h3>
      <Button type="fit" buttonStyle="black">
        내부 요소 기준 맞춤 버튼
      </Button>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">type="full"</h3>
      <Button type="full" buttonStyle="black">
        상위 컴포넌트 요소 맞춤 버튼
      </Button>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">type="grow, 4 colors"</h3>
      <div className="w-full flex flex-row gap-1">
        <Button type="grow" buttonStyle="black">
          박스의
        </Button>
        <Button type="grow" buttonStyle="gray">
          크기에
        </Button>
        <Button type="grow" buttonStyle="red">
          따라서
        </Button>
        <Button type="grow" buttonStyle="blue">
          균등하게
        </Button>
      </div>

      <hr className="mt-3" />

      <h2 className="semibold-32 ml-3 mt-3">Modal Component</h2>
      <p className="semibold-16 ml-3 mt-2 mb-3 text-grayscale-darkgray">
        모달 컴포넌트입니다. 버튼과 state를 활용하여 modal을 사용할 수 있습니다.
      </p>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">example</h3>
      <Button type="fit" buttonStyle="black" onClick={() => setIsModalOpen(true)}>
        이 버튼을 클릭하면 모달이 표시됩니다.
      </Button>
      <Modal
        modalText="모달에 표시되는 텍스트"
        cancelText="취소"
        confirmText="확인"
        cancelButtonStyle="black"
        confirmButtonStyle="red"
        confirmClick={() => console.log("확인 버튼 클릭")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <hr className="mt-3" />

      <h2 className="semibold-32 ml-3 mt-3">Toast Component</h2>
      <p className="semibold-16 ml-3 mt-2 mb-3 text-grayscale-darkgray">
        Toast 컴포넌트입니다. 경우에 따라 Alert, Success, Default로 나누어 사용할 수 있습니다.
      </p>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">Alert Toast</h3>
      <Button type="fit" buttonStyle="red" onClick={() => showToast({ message: "경고 메세지", type: "alert" })}>
        Alert Toast
      </Button>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">Success Toast</h3>
      <Button type="fit" buttonStyle="blue" onClick={() => showToast({ message: "성공 메세지", type: "success" })}>
        Success Toast
      </Button>

      <h3 className="semibold-20 ml-3 mt-3 mb-3">Black Toast</h3>
      <Button type="fit" buttonStyle="black" onClick={() => showToast({ message: "안내 메세지", type: "default" })}>
        Black Toast
      </Button>
    </>
  );
};

export default Example;
