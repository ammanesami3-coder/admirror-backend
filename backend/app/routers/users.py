from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users():
    return {"message": "Users route working!"}
