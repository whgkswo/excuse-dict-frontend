import { useEffect, useRef, useState } from "react";
import pageCss from '../../page.module.css';
import css from '../password_input/PasswordInput.module.css'
import { EP_CHECK_EMAIL_AVAILABILITY, EP_NICKNAME_CHECK, MAX_EMAIL_LENGTH, MAX_NICKNAME_LENGTH, MIN_NICKNAME_LENGTH } from "@/app/constants/constants";
import { apiGet } from "@/axios/requests/get/apiGet";
import Swal from "sweetalert2";
import TextLoadingWidget from "@/global_components/loading/TextLoadingWidget";
import { getErrorMessage } from "@/axios/handleFailure";

// 닉네임 입력창
export default function NicknameInput({ nicknameInput, setNicknameInput }: {
    nicknameInput: string,
    setNicknameInput: (value: string) => void,
}) {

    const [isNicknameCheckLoading, setNicknameCheckLoading] = useState(false);
    const [isNicknameAvailable, setNicknameAvailable] = useState(false);
    const [failText, setFailText] = useState('');
    const [shouldTextHidden, setShouldTextHidden] = useState(true);

    // 사용자 입력 대기시간 (ms)
    const waitTime = 800;

    const timeRef = useRef<NodeJS.Timeout>(null);
    const inputRef = useRef<string>(nicknameInput);

    const resetStates = () => {
        setNicknameCheckLoading(false);
        setNicknameAvailable(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        inputRef.current = input;

        setNicknameInput(input);
        handleTimer(e);
    }

    const isNicknameLengthValid = () => {
        return inputRef.current.length >= MIN_NICKNAME_LENGTH && inputRef.current.length <= MAX_NICKNAME_LENGTH;
    }

    // 이 안의 로직은 사용자가 입력을 멈추고 ${waitTime}ms 후에 실행됨
    const handleTimer = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 기존 타이머가 있다면 초기화
        if (timeRef.current) clearTimeout(timeRef.current);

        // 새로 카운트 시작
        timeRef.current = setTimeout(() => {
            // 상태 리셋
            resetStates();
            // 문구 표시 여부 변경
            console.log("inputRef: ", inputRef);
            if(isNicknameLengthValid()){
                setShouldTextHidden(false);
                // 유효성 검증 요청 서버에 전송
                sendNicknameCheckRequest();
            }else{ // 길이 안 맞으면 문구 숨기기
                setShouldTextHidden(true);
            }          
        }, waitTime);
    }

    // 사용 가능 닉네임
    const handleSuccess = () => {
        setNicknameAvailable(true);
        setNicknameCheckLoading(false);
        setFailText("닉네임 사용 가능");
    }

    const handleFailure = (error: any) => {
        setNicknameAvailable(false);
        setNicknameCheckLoading(false);
        setFailText(getErrorMessage(error));
    }

    // 닉네임 유효성 검사 요청 전송
    const sendNicknameCheckRequest = () => {
        console.log("nicknameInput: ", inputRef.current);
        setNicknameCheckLoading(true);
        apiGet({
            endPoint: EP_NICKNAME_CHECK,
            params: { nickname: inputRef.current },
            onSuccess: handleSuccess,
            onFail: (error) => handleFailure(error)
        });
    }

    return (
        <div className='global_input_container w-full'>
            <div className='global_input_label'>닉네임</div>
            <div className='global_input_inner_container'>
                <input
                    className='global_input w-[100%]'
                    placeholder={`닉네임을 입력해 주세요 (${MIN_NICKNAME_LENGTH}~${MAX_NICKNAME_LENGTH}자)`}
                    maxLength={MAX_NICKNAME_LENGTH}
                    value={nicknameInput}
                    onChange={handleChange}
                ></input>
                <TextLoadingWidget
                    isLoading={isNicknameCheckLoading}
                    isSucceed={isNicknameAvailable}
                    loadingText="닉네임 확인 중"
                    successText="사용 가능한 닉네임입니다."
                    failText={failText}
                    shouldHidden={shouldTextHidden}
                ></TextLoadingWidget>
            </div>
        </div>
    );
}

