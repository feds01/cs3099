import { getUser } from '../../lib/api/users/users';
import MarkdownRenderer from '../MarkdownRenderer';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ReactMde, { Suggestion } from 'react-mde';

/**
 * Function that queries the backend for username suggestions when the user begins
 * writing the tagging syntax within the field.
 *
 * @param input - The initial typed username or name of the person
 * @returns Suggestions generated from the server.
 */
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

/** Props provided to a markdown field */
type MarkdownFieldProps = {
    /** Initial comment content */
    contents?: string;
    /** Placeholder text when no content is provided */
    placeholder?: string;
    /** Function that is fired when content changes */
    onChange: (value: string) => void;
    /** If the field text-area should auto focus when rendered */
    autoFocus?: boolean;
};

export default function MarkdownField({
    onChange,
    placeholder = 'Leave a comment',
    autoFocus = true,
    contents = '',
}: MarkdownFieldProps) {
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
                    placeholder,
                    autoFocus,
                },
            }}
        />
    );
}
