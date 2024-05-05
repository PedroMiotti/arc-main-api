export class PayloadDto {
  Id: number;
  Email: string;
  ClientId: string;
  OwnerId: number;
  UserTypeId: number;
  iat: number;
  exp: number;

  constructor(
    Id: number,
    Email: string,
    ClientId: string,
    OwnerId: number,
    UserTypeId: number,
    iat: number,
    exp: number,
  ) {
    this.Id = Id;
    this.Email = Email;
    this.ClientId = ClientId;
    this.OwnerId = OwnerId;
    this.UserTypeId = UserTypeId;
    this.iat = iat;
    this.exp = exp;
  }
}
