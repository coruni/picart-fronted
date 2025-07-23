export interface Article {
    id?: number,
    title?: string,
    description?: string,
    image?: string,
    author: {
        id?: number,
        name?: string,
        avatar?: string,
    },
    likes?: number,
    collections?: number,
}