export class SessionDto {
  AccessToken: string;
  ExpiresIn: string;
  RefreshToken: string;

  constructor(AccessToken: string, ExpiresIn: string, RefreshToken: string) {
    this.AccessToken = AccessToken;
    this.ExpiresIn = ExpiresIn;
    this.RefreshToken = RefreshToken;
  }
}
