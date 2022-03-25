import { getUser } from '../../lib/api/users/users';
import MarkdownRenderer from '../MarkdownRenderer';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ReactMde, { Suggestion } from 'react-mde';

type CommentFieldProps = {
    contents?: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
};

async function loadUserSuggestions(input: string): Promise<Suggestion[]> {
    try {
        const result = await getUser({ search: input, take: 10 });

        return result.users.map((item) => {
            return {
                value: `@${item.username}`,
                preview: (
                    <Typography>
                        <span>@{item.username}</span> {typeof item.name !== 'undefined' && <>- {item.name}</>}
                    </Typography>
                ),
            };
        });
    } catch (e: unknown) {
        return [];
    }
}

export default function MarkdownField({ onChange, autoFocus = true, contents = '' }: CommentFieldProps) {
    const [value, setValue] = useState<string>(contents);
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Focus the text area on initial render
    useEffect(() => {
        if (autoFocus && textAreaRef.current !== null) {
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
            loadSuggestions={loadUserSuggestions}
            generateMarkdownPreview={(markdown) => Promise.resolve(<MarkdownRenderer contents={markdown} />)}
            childProps={{
                writeButton: {
                    tabIndex: -1,
                },
                textArea: {
                    placeholder: 'Leave a comment',
                    autoFocus,
                },
            }}
        />
    );
}
