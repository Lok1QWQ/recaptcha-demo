import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
  } from 'react';
  import {
    cleanGoogleRecaptcha,
    injectGoogleReCaptchaScript,
    logWarningMessage
  } from './utils';
  
  const GoogleRecaptchaError = {
    SCRIPT_NOT_AVAILABLE : 'Recaptcha script is not available'
  }
  

  
  const GoogleReCaptchaContext = createContext({
    executeRecaptcha: () => {
      // This default context function is not supposed to be called
      throw Error(
        'GoogleReCaptcha Context has not yet been implemented, if you are using useGoogleReCaptcha hook, make sure the hook is called inside component wrapped by GoogleRecaptchaProvider'
      );
    }
  });
  
  const { Consumer: GoogleReCaptchaConsumer } = GoogleReCaptchaContext;
  
  export const GoogleReCaptchaProvider = ({
    reCaptchaKey,
    useEnterprise = false,
    useRecaptchaNet = false,
    scriptProps,
    language,
    container,
    children
  }) =>  {
    const [greCaptchaInstance, setGreCaptchaInstance] = useState(null);
    const clientId = useRef(reCaptchaKey);
  
    const scriptPropsJson = JSON.stringify(scriptProps);
    const parametersJson = JSON.stringify(container?.parameters);
  
    useEffect(() => {
      if (!reCaptchaKey) {
        logWarningMessage(
          '<GoogleReCaptchaProvider /> recaptcha key not provided'
        );
  
        return;
      }
  
      const scriptId = scriptProps?.id || 'google-recaptcha-v3';
      const onLoadCallbackName = scriptProps?.onLoadCallbackName || 'onRecaptchaLoadCallback';
  
      window[onLoadCallbackName] = () => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const grecaptcha = useEnterprise
          ? window.grecaptcha.enterprise
          : window.grecaptcha;
      
        const params = {
          badge: 'inline',
          size: 'invisible',
          sitekey: reCaptchaKey,
          ...(container && container.parameters ? container.parameters : {})
        };
        clientId.current = grecaptcha.render(container && container.element, params);
      };
  
      const onLoad = () => {
        if (!window || !window.grecaptcha) {
            logWarningMessage(
              `<GoogleRecaptchaProvider /> ${GoogleRecaptchaError.SCRIPT_NOT_AVAILABLE}`
            );
        
            return;
          }
        
          const grecaptcha = useEnterprise
            ? window.grecaptcha.enterprise
            : window.grecaptcha;
        
          grecaptcha.ready(() => {
            setGreCaptchaInstance(grecaptcha);
          });
      };
  
      const onError = () => {
        logWarningMessage('Error loading google recaptcha script');
      };
  
      injectGoogleReCaptchaScript({
        render: container?.element ? 'explicit' : reCaptchaKey,
        onLoadCallbackName,
        useEnterprise,
        useRecaptchaNet,
        scriptProps,
        language,
        onLoad,
        onError
      });
  
      return () => {
        cleanGoogleRecaptcha(scriptId, container?.element);
      };
    }, [
      useEnterprise,
      useRecaptchaNet,
      scriptPropsJson,
      parametersJson,
      language,
      reCaptchaKey,
      container?.element,
    ]);
  
    const executeRecaptcha = useCallback(
      (action?: string) => {
        if (!greCaptchaInstance || !greCaptchaInstance.execute) {
          throw new Error(
            '<GoogleReCaptchaProvider /> Google Recaptcha has not been loaded'
          );
        }
  
        return greCaptchaInstance.execute(clientId.current, { action });
      },
      [greCaptchaInstance, clientId]
    );
  
    const googleReCaptchaContextValue = useMemo(
      () => ({
        executeRecaptcha: greCaptchaInstance ? executeRecaptcha : undefined,
        container: container?.element,
      }),
      [executeRecaptcha, greCaptchaInstance, container?.element]
    );
  
    return (
      <GoogleReCaptchaContext.Provider value={googleReCaptchaContextValue}>
        {children}
      </GoogleReCaptchaContext.Provider>
    );
  }
  
  export { GoogleReCaptchaConsumer, GoogleReCaptchaContext };
  