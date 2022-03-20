export interface PublicationIndex {
    username: string;
    name: string;
    revision?: string;
}

export function constructBasePath(index: PublicationIndex) {
    const { username, name, revision } = index;
    let items = [username, name];

    if (typeof revision !== 'undefined') {
        items.push(revision);
    }

    return '/' + items.join('/');
}
