import datetime
import os
from typing import Optional

import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token expiry time

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    """ Generate a JWT token """
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str):
    """ Verify the JWT token and return the payload """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_password(plain_password, hashed_password):
    """ Verify password against the stored hash """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """ Hash password for storage """
    return pwd_context.hash(password)
