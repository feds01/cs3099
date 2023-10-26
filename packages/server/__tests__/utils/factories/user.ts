import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { IUser, IUserRole } from '../../../src/models/User';

/**
 * Function use to create a mocked user object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation.
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked user DTO
 */
export function createMockedUser(baseDto?: Partial<IUser>): IUser {
    const dto = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        name: faker.name.findName(),
        about: faker.lorem.sentence(),
        password: faker.internet.password(),
        role: faker.random.arrayElement(Object.values(IUserRole)),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
    };

    return { ...dto, ...baseDto };
}

/**
 * Function to extend an @see IUser object to contain the internal MongoDB
 * id so that it can be projected using the defined static method.
 *
 * @param user - The user object
 *
 * @return Returns an extended user object with an `_id` field
 */
export function extendUserObject(dto: IUser, id: string): IUser {
    return {
        ...dto,
        // @ts-ignore
        _id: new mongoose.Types.ObjectId(id),
    };
}
