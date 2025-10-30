from fastapi import APIRouter

router = APIRouter(prefix="/ads", tags=["Ads"])

@router.get("/")
def list_ads():
    return {"message": "Ads route working!"}
