import React, { useState, useCallback, useEffect } from 'react';
import { useGoogleReCaptcha } from './use-google-recaptcha';

export const GoogleRecaptchaExample = () => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [dynamicAction, setDynamicAction] = useState('homepage');
    const [actionToChange, setActionToChange] = useState('');

    

    const handleTextChange = useCallback((event) => {
        setActionToChange(event.target.value);
    }, []);

    const handleCommitAction = useCallback(() => {
        setDynamicAction(actionToChange);
    }, [actionToChange]);

    useEffect(() => {
        if (!executeRecaptcha || !dynamicAction) {
            return;
        }

        const handleReCaptchaVerify = async () => {
          try {
            const token = await executeRecaptcha();
            
            console.log(token);

            const response = await fetch('http://localhost:3001/verify-recaptcha', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ recaptchaToken: token }),
            });
    
            if (response.ok) {
              console.error('reCAPTCHA verification success');
            } else {
              console.error('reCAPTCHA verification failed');
            }
          } catch (error) {
            console.error('Error during reCAPTCHA verification:', error);
          }
        };
    
        handleReCaptchaVerify();
      }, [executeRecaptcha, dynamicAction]);

    return (
        <div>
            <div>
                <p>Current ReCaptcha action: {dynamicAction}</p>
                <input type='text' onChange={handleTextChange} value={actionToChange} />
                <button onClick={handleCommitAction}>Change action</button>
            </div>
        </div>
    );
};
