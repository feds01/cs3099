import { Publication, User } from '../../lib/api/models';
import { getSearchPublication, getSearchUser } from '../../lib/api/search/search';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

type SearchBarProps = {};

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

function SearchBar({}: SearchBarProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<string>('');
    const [options, setOptions] = useState<readonly SearchResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function searchForResource() {
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

        searchForResource();
    }, [input]);

    const handleChange = (e: React.SyntheticEvent, value: SearchResponse | string) => {
        if (typeof value === 'string') {
            console.log(value);
            setInput(value);
        } else {
            console.log('take me there....');
        }
    }

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
                        {option.group !== 'query' && <Box sx={{ml: 1}}>{option.group}</Box>}
                        {option.children}
                    </React.Fragment>
                );
            }}
            getOptionLabel={(option) => {
                if (option.type === 'publication') {
                    return option.data.name;
                } else if (option.type === 'user') {
                    return option.data.username;
                } else if (option.type === 'query') {
                    return option.data !== '' ? `Search '${option.data}' on Iamus` : `Search...`;
                }

                return typeof option === 'string' ? option : 'unknown';
            }}
            inputMode={'search'}
            inputValue={input}
            openOnFocus
            onInputChange={handleChange}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Search Iamus..."
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
