import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { IPublication } from '../../../src/models/Publication';

/**
 * Function use to create a mocked publication object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation.
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked publication DTO
 */
export function createMockedPublication(baseDto?: Partial<IPublication>): IPublication {
    const dto = {
        owner: new mongoose.Types.ObjectId(),
        revision: faker.company.companyName(),
        pinned: faker.datatype.boolean(),
        current: faker.datatype.boolean(),
        draft: faker.datatype.boolean(),
        name: faker.commerce.productName(),
        title: faker.commerce.productDescription(),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        collaborators: [],
    };

    return { ...dto, ...baseDto };
}
