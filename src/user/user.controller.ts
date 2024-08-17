import { Controller, Get, Query } from '@nestjs/common';
import {
  GetOptionPipeTransfrom,
  GetOptionsDto,
  GetUsersDto,
  GetUsersPipeTransfrom,
} from './dto/get-users.dto'; // Kita akan membuat DTO ini selanjutnya
import { User } from './user.interface';
import userDummy from './user.dummy';

@Controller('user')
export class UserController {
  private readonly dummyUsers: User[] = userDummy;

  @Get()
  getUsers(@Query(GetUsersPipeTransfrom) query: GetUsersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      country,
      minAge,
      maxAge,
      sortBy,
      sortOrder,
    } = query;

    let filteredUsers = this.dummyUsers;

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      filteredUsers = this.dummyUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseSearch) ||
          user.email.toLowerCase().includes(lowerCaseSearch) ||
          user.address.city.toLowerCase().includes(lowerCaseSearch) ||
          user.address.country.toLowerCase().includes(lowerCaseSearch),
      );
    }

    if (country) {
      filteredUsers = filteredUsers.filter(
        (user) => user.address.country.toLowerCase() === country.toLowerCase(),
      );
    }

    if (minAge) {
      filteredUsers = filteredUsers.filter((user) => user.age >= minAge);
    }

    if (maxAge) {
      filteredUsers = filteredUsers.filter((user) => user.age <= maxAge);
    }

    if (sortBy) {
      filteredUsers.sort((a, b) => {
        const comparison = a[sortBy].localeCompare(b[sortBy]);
        return sortOrder == 1 ? comparison : -comparison;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      totalRecords: filteredUsers.length, // Total setelah filter
    };
  }

  @Get('options')
  getCountryOptions(@Query(GetOptionPipeTransfrom) query: GetOptionsDto) {
    console.log('🚀 ~ UserController ~ getCountryOptions ~ query:', query);
    const { country } = query;
    const countries = new Set(
      this.dummyUsers.map((user) => user.address.country),
    );

    const countryOptions = country
      ? Array.from(countries).map((c) => ({
          label: c,
          value: c,
        }))
      : [];

    return {
      data: {
        countryOptions,
      },
    };
  }
}
