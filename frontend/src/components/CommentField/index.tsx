import ReactMde from 'react-mde';
import MarkdownRenderer from '../MarkdownRenderer';
import { useEffect, useRef, useState } from 'react';

type CommentFieldProps = {
    contents?: string;
    onChange: (value: string) => void;
};

// TODO: in the future, add support for images
// TODO: we can also use the suggestion for usernames.
export default function CommentField({ onChange, contents = '' }: CommentFieldProps) {
    const [value, setValue] = useState<string>(contents);
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Focus the text area on initial render
    useEffect(() => {
        if (textAreaRef.current !== null) {
            textAreaRef.current.focus();
        }
    }, [textAreaRef]);

    useEffect(() => {
        onChange(value);
    }, [value]);

    return (
        <ReactMde
            value={value}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            refs={{
                textarea: textAreaRef,
            }}
            generateMarkdownPreview={(markdown) => Promise.resolve(<MarkdownRenderer contents={markdown} />)}
            childProps={{
                writeButton: {
                    tabIndex: -1,
                },
                textArea: {
                    placeholder: 'Leave a comment',
                    autofocus: true,
                },
            }}
        />
    );
}