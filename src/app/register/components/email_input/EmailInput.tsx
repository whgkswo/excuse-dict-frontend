import { useEffect } from "react";
import css from './EmailInput.module.css'
import pageCss from '../../page.module.css';
import { EP_CHECK_EMAIL_AVAILABILITY, MAX_EMAIL_LENGTH } from "@/app/constants/constants";
import { apiGet } from "@/axios/requests/get/apiGet";
import Swal from "sweetalert2";
import { useEmailVerification } from "../../verification/useEmailVerification";
import {useRecaptcha} from "@/app/recaptcha/useRecaptcha";
import ReCAPTCHAComponent from "@/app/recaptcha/ReCAPTCHAComponent";

// 이메일 입력창
export default function EmailInput({ emailVerification, setModalOpen }: {
    emailVerification: ReturnType<typeof useEmailVerification>;
    setModalOpen: (value: boolean) => void,
}) {

    const {
        emailInput,
        setEmailInput,
        isEmailVerified,
    } = emailVerification;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        setEmailInput(input);
    }

    const isEmailValidSimple = () => {
        return emailInput.length > 0 && emailInput.includes('@');
    }

    const handleClick = async() => {
        // 이메일 유효성 간략하게 검증
        if (!isEmailValidSimple()) {
            Swal.fire("오류", "이메일을 올바르게 입력해주세요", "warning");
            return;
        }

        // 이메일 중복 확인
        apiGet({
            endPoint: EP_CHECK_EMAIL_AVAILABILITY,
            params: { email: emailInput },
            onSuccess: () => {
                // 사용 가능 이메일 -> 모달 오픈
                setModalOpen(true);
            },
        });
    }

    return (
        <div className='global_input_container w-full'>
            <div className='global_input_label'>이메일</div>
            <div className='global_input_inner_container'>
                <input
                    className='global_input w-[100%]'
                    placeholder={`이메일을 입력해 주세요 (최대 ${MAX_EMAIL_LENGTH}자)`}
                    type='email'
                    readOnly={isEmailVerified}
                    maxLength={MAX_EMAIL_LENGTH}
                    value={emailInput}
                    onChange={handleChange}
                ></input>
                <button
                    className={css.email_dupl_check}
                    disabled={isEmailVerified}
                    onClick={handleClick}
                >{isEmailVerified ? '인증 완료' : '인증'}</button>
            </div>
        </div>
    );
}