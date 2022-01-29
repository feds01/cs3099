import { useEffect, useState } from 'react';
import ReactMde from 'react-mde';
import MarkdownRenderer from '../MarkdownRenderer';

type CommentFieldProps = {
    contents?: string;
    onChange: (value: string) => void;
};

// TODO: in the future, add support for images
// TODO: we can also use the suggestion for usernames.
export default function CommentField({ onChange, contents = '' }: CommentFieldProps) {
    const [value, setValue] = useState<string>(contents);
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

    useEffect(() => {
        onChange(value);
    }, [value])

    return (
        <ReactMde
            value={value}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={(markdown) => Promise.resolve(<MarkdownRenderer contents={markdown} />)}
            childProps={{
                writeButton: {
                    tabIndex: -1,
                },
            }}
        />
    );
}
