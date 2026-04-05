import React, { useRef, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar/Navbar";

/* ===== LOTTIE COMPONENT (NEW) ===== */

const LottieAnimation = ({ src }: { src: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@dotlottie/player-component").then(() => {
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <dotlottie-player
            src="${src}"
            autoplay
            loop
            style="width:100%;height:100%"
          ></dotlottie-player>
        `;
      }
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "520px"
      }}
    />
  );
};

/* ===== ICONS ===== */

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const UniversityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22,8 12,2 2,8 12,14"/>
    <line x1="6" y1="10" x2="6" y2="18"/>
    <line x1="10" y1="10" x2="10" y2="18"/>
    <line x1="14" y1="10" x2="14" y2="18"/>
    <line x1="18" y1="10" x2="18" y2="18"/>
    <line x1="2" y1="18" x2="22" y2="18"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const ScalesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/>
    <line x1="3" y1="7" x2="21" y2="7"/>
    <path d="M6 7L3 14a3 3 0 0 0 6 0L6 7z"/>
    <path d="M18 7l-3 7a3 3 0 0 0 6 0L18 7z"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

/* ===== ANIMATIONS ===== */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const GlobalFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
`;

/* ===== COMPONENT ===== */

const Signup = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      return;
    }

    const user = {
      id: "",
      email: params.get("email") || "",
      name: params.get("name") || "",
      picture: params.get("picture") || "",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/cases", { replace: true });
  }, [navigate]);

  const handleGoogleSignup = () => {
    const frontendRedirect = `${window.location.origin}/signup`;
    window.location.href = `http://localhost:8000/api/auth/google?frontend_redirect=${encodeURIComponent(frontendRedirect)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      navigate("/cases");
    }, 500);
  };

  return (
    <>
      <GlobalFonts />
      <Container>

        {/* NAVBAR */}
        <Navbar />

        {/* FORM + LOTTIE */}
        <FormWrapper>

          {/* LEFT SIDE — STYLED FORM */}
          <StyledWrapper>
            <form className="form" onSubmit={handleSubmit}>

              <FormHeader>
                <ScalesIcon />
                <FormTitle>Join the Courtroom</FormTitle>
                <FormSubtitle>Start your legal journey today</FormSubtitle>
              </FormHeader>

              <Divider />

              {/* Full Name */}
              <FieldGroup>
                <FieldLabel>Full Name</FieldLabel>
                <InputRow>
                  <IconWrap><UserIcon /></IconWrap>
                  <StyledInput placeholder="Enter your full name" required />
                </InputRow>
              </FieldGroup>

              {/* College / University */}
              <FieldGroup>
                <FieldLabel>College / University</FieldLabel>
                <InputRow>
                  <IconWrap><UniversityIcon /></IconWrap>
                  <StyledInput placeholder="Enter your college/university" required />
                </InputRow>
              </FieldGroup>

              {/* Email */}
              <FieldGroup>
                <FieldLabel>Email Address</FieldLabel>
                <InputRow>
                  <IconWrap><EmailIcon /></IconWrap>
                  <StyledInput type="email" placeholder="Enter your email" required />
                </InputRow>
              </FieldGroup>

              {/* Legal Specialisation */}
              <FieldGroup>
                <FieldLabel>Legal Specialisation</FieldLabel>
                <InputRow>
                  <IconWrap><StarIcon /></IconWrap>
                  <StyledInput placeholder="Enter your legal specialisation" required />
                </InputRow>
              </FieldGroup>

              {/* Password */}
              <FieldGroup>
                <FieldLabel>Password</FieldLabel>
                <InputRow>
                  <IconWrap><LockIcon /></IconWrap>
                  <StyledInput type="password" placeholder="Create a password" required />
                </InputRow>
              </FieldGroup>

              {/* Submit */}
              <SubmitButton type="submit">Create Account</SubmitButton>

              {/* Sign in */}
              <SignInText>
                Already have an account?{' '}
                <InlineLink onClick={() => navigate('/authentication')}>Sign In</InlineLink>
              </SignInText>

              {/* Divider */}
              <OrDivider><span>Or continue with</span></OrDivider>

              {/* Google */}
              <GoogleButton type="button" onClick={handleGoogleSignup}>
                <GoogleIcon />
                Sign up with Google
              </GoogleButton>

            </form>
          </StyledWrapper>

          {/* RIGHT SIDE — LOTTIE */}
          <RightSide>
            <LottieAnimation src="https://lottie.host/fd9bc3cd-7389-4f72-ad75-9561924b8333/GpEnDcTuJR.lottie" />
          </RightSide>

        </FormWrapper>

        {/* FOOTER */}
        <Footer>
          <LeftFooter>© 2026 Adjournment AI. All rights reserved.</LeftFooter>
          <RightFooter>Terms of Service | Privacy Policy | Help Center | Contact Us</RightFooter>
        </Footer>

      </Container>
    </>
  );
};

export default Signup;


/* ================= STYLES ================= */

const Container = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
`;

const LogoIcon = styled.span`margin-right: 6px;`;

const Logo = styled.div`
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
`;

const LogoSpan = styled.span`
  color: #60a5fa;
  margin-left: 4px;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
`;

const FormWrapper = styled.div`
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 60px;

  padding: 40px 24px;

  @media (max-width: 1024px) {
    gap: 40px;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 32px 18px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

const RightSide = styled.div`
  width: 700px;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    display: none;
  }
`;

/* ===== FORM CARD ===== */

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: #ffffff;
    padding: 36px 38px 32px;
    width: 100%;
max-width: 430px;
    border-radius: 18px;
    box-shadow:
      0 0 0 1px rgba(30,58,138,0.08),
      0 4px 6px rgba(15,23,42,0.06),
      0 20px 60px rgba(15,23,42,0.1);
    position: relative;
    animation: ${fadeUp} 0.55s cubic-bezier(.22,.68,0,1.2) both;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa, #3b82f6, #1e3a8a);
    }
  }
`;

const FormHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  padding-top: 4px;
`;

const FormTitle = styled.h2`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: 0.3px;
  text-align: center;
`;

const FormSubtitle = styled.p`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 13px;
  font-style: italic;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.4px;
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent);
  margin-bottom: 22px;
`;

/* ===== FIELDS ===== */

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #1e3a8a;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  background: #f8faff;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

  &:focus-within {
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }
`;

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  color: #3b82f6;
  margin-right: 10px;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 12px 0;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 15px;
  color: #0f172a;

  &::placeholder {
    color: #94a3b8;
    font-style: italic;
  }
`;

/* ===== SUBMIT BUTTON ===== */

const SubmitButton = styled.button`
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  background-size: 200% auto;
  color: #ffffff;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(37,99,235,0.3);
  margin-bottom: 16px;

  &:hover {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(37,99,235,0.45);
  }
  &:active { transform: translateY(0); }
`;

/* ===== SIGN IN TEXT ===== */

const SignInText = styled.p`
  text-align: center;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
`;

const InlineLink = styled.span`
  color: #2563eb;
  cursor: pointer;
  font-style: italic;
  transition: color 0.2s;
  &:hover { color: #1e3a8a; }
`;

/* ===== OR DIVIDER ===== */

const OrDivider = styled.div`
  position: relative;
  text-align: center;
  margin-bottom: 16px;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background: #dbeafe;
  }
  &::before { left: 0; }
  &::after  { right: 0; }

  span {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px;
    font-style: italic;
    color: #94a3b8;
    letter-spacing: 0.5px;
    padding: 0 10px;
    position: relative;
    z-index: 1;
  }
`;

/* ===== GOOGLE BUTTON ===== */

const GoogleButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: #f8faff;
  color: #1e3a8a;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;

  &:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

/* ===== FOOTER ===== */

const Footer = styled.footer`
  padding: 14px 24px;

  background: linear-gradient(
    90deg,
    #0f172a 0%,
    #1e3a8a 100%
  );

  display: flex;
  justify-content: space-between;

  font-size: 12px;
  color: #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
  }
`;

const LeftFooter = styled.div``;
const RightFooter = styled.div``;