import { UseGuards, Request, Req } from '@nestjs/common';
import { Args, Context, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ObjectType()
class JwtResponse  { 
  @Field()
  access_token: string 
};

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Query(() => JwtResponse)
  async login(
    @Args('login') login: string, 
    @Args('password') password: string, 
    @Context('req') req
  ) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  getProfile(@Context('req') req): User {  
    return req.user;
  }

}