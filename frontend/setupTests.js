/** 
 * Mock remark-github and friends since they use ESM and this isn't currently 
 * working in Webpack 5
 */
jest.mock("react-markdown", () => (props) => {
    return <>{props.children}</>
})

jest.mock("remark-gfm", () => () => {
})

jest.mock("remark-github", () => () => {
})
