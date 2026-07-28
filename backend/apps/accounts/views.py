from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken

from .serializers import LoginSerializer, RegisterSerializer

User = get_user_model()


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response(
                {"code": "invalid_credentials", "message": "Credenciais inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.company is None:
            return Response(
                {
                    "code": "no_company",
                    "message": "Sua conta ainda não está vinculada a uma empresa. Aguarde liberação do administrador."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        _, token = AuthToken.objects.create(user)

        logo_url = None
        if user.company.logo:
            logo_url = request.build_absolute_uri(user.company.logo.url)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "company_id": str(user.company.id),
                    "company_name": user.company.nome_fantasia or user.company.razao_social,
                    "company_logo": logo_url,
                },
                "token": token,
            },
            status=status.HTTP_200_OK,
        )


class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        users = User.objects.all()
        data = [{"id": u.id, "email": u.email} for u in users]
        return Response(data, status=status.HTTP_200_OK)