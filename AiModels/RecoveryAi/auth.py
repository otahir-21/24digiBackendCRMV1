from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import random
import hashlib
from config import settings
from models import User, get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def generate_otp() -> str:
    """Generate a 4-digit OTP"""
    return str(random.randint(1000, 9999))

def hash_otp(otp: str) -> str:
    """Hash OTP for secure storage"""
    return hashlib.sha256(otp.encode()).hexdigest()

def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verify OTP against hash"""
    return hash_otp(plain_otp) == hashed_otp

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def send_otp_email(email: str, otp: str):
    """Send OTP via email (implement with your email provider)"""
    # TODO: Implement actual email sending
    print(f"Sending OTP {otp} to email {email}")
    # Example with SMTP:
    # import smtplib
    # from email.mime.text import MIMEText
    # msg = MIMEText(f"Your OTP is: {otp}")
    # msg['Subject'] = 'Your Recovery App OTP'
    # msg['From'] = settings.SMTP_USER
    # msg['To'] = email
    # with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
    #     server.starttls()
    #     server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    #     server.send_message(msg)

def send_otp_sms(mobile: str, otp: str):
    """Send OTP via SMS (implement with Twilio or other provider)"""
    # TODO: Implement actual SMS sending
    print(f"Sending OTP {otp} to mobile {mobile}")
    # Example with Twilio:
    # from twilio.rest import Client
    # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    # message = client.messages.create(
    #     body=f"Your Recovery App OTP is: {otp}",
    #     from_=settings.TWILIO_PHONE_NUMBER,
    #     to=mobile
    # )
