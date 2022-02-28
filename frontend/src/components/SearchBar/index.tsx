import { Publication, User } from '../../lib/api/models';
import { getSearchPublication, getSearchUser } from '../../lib/api/search/search';
import UserAvatar from '../UserAvatar';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { debounce } from 'lodash';
import React, { useEffect, useCallback, useState } from 'react';
import { BsJournalCode } from 'react-icons/bs';
import { useHistory } from 'react-router-dom';

type SearchResponse =
    | {
          type: 'user';
          data: User;
      }
    | {
          type: 'publication';
          data: Publication;
      }
    | {
          type: 'query';
          data: string;
      };

function SearchBar() {
    const history = useHistory();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<string>('');
    const [options, setOptions] = useState<readonly SearchResponse[]>([]);
    const [loading, setLoading] = useState(false);

    async function searchForResource(input: string) {
        // Don't query the backend if no query is provided
        if (input === '') {
            setOptions([]);
            return;
        }

        setLoading(true);

        try {
            const userSearch = await getSearchUser({ query: input, take: 5 });
            const publicationSearch = await getSearchPublication({ query: input, take: 5 });

            const newOptions = [
                ...userSearch.users.map((item) => ({ type: 'user', data: item })),
                ...publicationSearch.publications.map((item) => ({ type: 'publication', data: item })),
                { type: 'query', data: input },
            ] as SearchResponse[];

            setOptions(newOptions);
        } catch (e: unknown) {
            console.log('failed loading data');
        } finally {
            setLoading(false);
        }
    }

    const debouncedSearch = useCallback(debounce(searchForResource, 200), []);

    useEffect(() => {
        debouncedSearch(input);
    }, [input]);

    const getOptionLabel = (option: SearchResponse) => {
        if (option.type === 'publication') {
            return option.data.name;
        } else if (option.type === 'user') {
            return option.data.username;
        } else if (option.type === 'query') {
            return option.data !== '' ? `Search '${option.data}' on Iamus` : `Search...`;
        }

        return 'Search...';
    };

    const getOptionIcon = (option: SearchResponse) => {
        switch (option.type) {
            case 'publication':
                return <BsJournalCode />;
            case 'user':
                return <UserAvatar size={28} {...option.data} />;
            case 'query':
                return <SearchIcon />;
        }
    };

    const getOptionDescription = (option: SearchResponse): string | undefined => {
        switch (option.type) {
            case 'publication':
                return option.data.about || `posted by ${option.data.owner.username}`;
            case 'user':
                return option.data.about;
            case 'query':
                return;
        }
    };

    return (
        <Autocomplete
            sx={{ width: 300 }}
            open={open}
            freeSolo
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            groupBy={(option) => option.type}
            renderGroup={(option) => {
                return (
                    <React.Fragment key={option.key}>
                        {option.group !== 'query' && (
                            <Box sx={{ ml: 1, textTransform: 'capitalize' }}>{option.group}s</Box>
                        )}
                        {option.children}
                    </React.Fragment>
                );
            }}
            getOptionLabel={getOptionLabel}
            renderOption={(props, option) => {
                const label = getOptionLabel(option);
                const icon = getOptionIcon(option);
                const description = getOptionDescription(option);

                return (
                    <Box
                        component={'li'}
                        {...props}
                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    >
                        <Box sx={{ pr: 1 }}>{icon}</Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{label} </Typography>
                        {typeof description !== 'undefined' && (
                            <Box
                                component="span"
                                sx={{
                                    textOverflow: 'ellipsis',
                                    fontStyle: 'italic',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                - {description}
                            </Box>
                        )}
                    </Box>
                );
            }}
            inputMode={'search'}
            inputValue={input}
            openOnFocus
            disableCloseOnSelect={false}
            clearOnEscape
            onChange={(event, value) => {
                if (typeof value !== 'string' && value !== null) {
                    // Here we have to construct a link to the resource that the user has
                    // selected to navigate to. If it is a user, then they are directed to
                    // their profile page. If it is a publication, then they are directed
                    // to the actual publication.. If it is a query, they are taken to
                    // the 'explore' page with the query as state...
                    if (value.type === 'user') {
                        history.push(`/profile/${value.data.username}`);
                    } else if (value.type === 'publication') {
                        history.push(`/${value.data.owner.username}/${value.data.name}/${value.data.revision}`);
                    } else {
                        history.push(`/explore`, { query: value.data });
                    }
                }
            }}
            onInputChange={(e, value) => setInput(value)}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Search Iamus..."
                    sx={{ background: 'white' }}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon />,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default SearchBar;
