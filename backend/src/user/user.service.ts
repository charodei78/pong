import { ConflictException, Injectable } from '@nestjs/common';
import { FindConditions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSalt, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageService } from 'src/common/storage/storage.service';
import * as sharp from 'sharp';
import { join } from 'path';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadAvatar(
    image: Express.Multer.File,
    userId: number,
  ): Promise<string[]> {
    const user = await this.findOne(userId);

    const sharpLarge = sharp(image.buffer).resize(512).toFormat('webp');
    const sharpIco = sharpLarge.clone().resize(64, 64);

    const uploadPath = join('avatars', user.id.toString(), 'avatar');

    const put = this.storageService.put.bind(this.storageService);
    const paths = await Promise.all([
      put(await sharpIco.toBuffer(), uploadPath + '_ico' + '.webp'),
      put(await sharpLarge.toBuffer(), uploadPath + '.webp'),
    ]);

    const oldAvatar = user.avatar;

    user.avatar = paths;
    await this.prisma.user.create({ data: user });

    this.storageService.delete(...oldAvatar);

    return user.avatar;
  }

  async create(createUserDto: CreateUserDto) {
    const exists = await this.count({
      email: createUserDto.email,
      login: createUserDto.login,
    });

    if (exists != 0) throw new ConflictException();

    const salt = await genSalt(10);
    const password = await hash(createUserDto.password, salt);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password },
    });
    return user;
  }

  async findAll(take = 15, skip = 0) {
    return this.prisma.user.findMany({ take, skip });
  }

  async findMany(ids: number[]) {
    return this.prisma.user.findMany({ where: { id: { in: ids } } });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) return null;
    const updated = { ...user, ...dto };

    return this.prisma.user.update({ where: { id }, data: updated });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async find(search) {
    return this.prisma.user.findUnique({
      where: { login: 'tester2' },
    });
  }

  async count(options) {
    return this.prisma.user.count({ where: options });
  }

  async findOrCreate(dto: CreateUserDto) {
    const user: User = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      return user;
    }

    return await this.create(dto);
  }
}
