import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get("get_all_users")
  getAllUsers() {
    return this.UserService.getAllUsers();
  }

  @Get("get_user/:id")
  getUser(@Param("id") id: string) {
    return this.UserService.getUserById(id);
  }

  @Get("get_user_by_email/:email")
  getUserByEmail(@Param("email") email: string) {
    return this.UserService.getUserByEmail(email);
  }

  @Post("register")
  registerUser(@Body() dto: UserDto) {
    return this.UserService.registerUser(dto);
  }

  @Post("login")
  loginUser(@Body() dto: UserDto) {
    return this.UserService.loginUser(dto);
  }
}
