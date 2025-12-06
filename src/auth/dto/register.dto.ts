export class RegisterDto {
  name: string;
  email: string;
  password: string;
  // role всегда 'client' для регистрации клиентов (операторы создаются через seed)
}

