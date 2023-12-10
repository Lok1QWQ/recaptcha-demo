import { GoogleReCaptchaProvider } from './google-recaptcha-provider';
import { GoogleRecaptchaExample } from './google-recaptcha-example';

function App() {
  return (
    <div>
      <GoogleReCaptchaProvider
    reCaptchaKey='6LciDikpAAAAAJpFmYfrFquUjaGjXa3geZTr2ARC'
  >
    <h2>Google Recaptcha</h2>
    <GoogleRecaptchaExample />
  </GoogleReCaptchaProvider>
    </div>
  );
}

export default App;
