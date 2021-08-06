import {
  NotFoundException,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Public } from 'src/common/auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserByIdPipe } from './pipes/user-by-id.pipe';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { name: 'createUser' })
  @Public()
  @UsePipes(ValidationPipe)
  async create(@Args('input') createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Query(() => User, { name: 'user' })
  async findOneById(@Args('id', { type: () => Int }, UserByIdPipe) user: User) {
    if (!user) throw new NotFoundException();
    return user;
  }

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args('limit', { type: () => Int }, new DefaultValuePipe(15), ParseIntPipe) limit,
    @Args('offset', { type: () => Int }, new DefaultValuePipe(0), ParseIntPipe) offset,
  ) {
    if (limit > 100) throw new BadRequestException();
    return this.userService.findAll(limit, offset);
  }

  @Mutation(() => User, { name: 'updateUser' })
  @UsePipes(ValidationPipe)
  async update(
    @Args('id', ParseIntPipe) id: number,
    @Args('input') updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(id, updateUserDto);
    if (!updated) throw new NotFoundException();

    return updated;
  }

  @Mutation(() => Boolean, { name: 'removeUser' })
  async remove(@Args('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return true;
  }
}
