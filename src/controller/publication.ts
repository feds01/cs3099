import { AugmentedPublicationDocument } from '../models/Publication';

export default class PublicationController {
    constructor(readonly publication: AugmentedPublicationDocument) {}

    async delete() {}

    async patch() {}

    async get() {}

    async export() {}

    async tree(_path: string) {}

    async all() {}
}
