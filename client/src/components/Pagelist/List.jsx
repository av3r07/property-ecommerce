import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, FormControl, InputLabel, ListItem, MenuItem, Select, TablePagination, TextField, Typography } from '@mui/material';
import Popup from './Popup';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import Addpopup from './Addpopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
const headData = [
    {
        id: 'ID',
        label: 'ID',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'name',
        label: 'Name',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'status',
        label: 'Status',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'action',
        label: 'Action',
        format: (value) => value.toLocaleString(),
    },

]

export default function List() {
    const [open, setOpen] = useState(false);
    const [addopen, setAddopen] = useState(false);
    const [tabledata, setTabledata] = useState([])
    const [alert, setAlert] = useState(null);
    const [search, setSearch] = useState('');
    const [edit, setEdit] = useState({ id: null, name: '' });
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [status_val, setStatus_val] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        const token = localStorage.getItem('admintoken')
        axios.post('http://83.136.219.147:4000/v1/api/admin/fetchBlogCategories', {},
            {
                headers: {
                    Authorization: token
                }
            }
        )
            .then(function (response) {
                setTabledata(response.data.data)
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
            });
    }


    const submitUpdate = value => {
        fetchData()
        setEdit({
            id: null, name: ''
        });
    };

    const notify = (msg) => {
        toast.success(msg, {
            position: "top-center",
            autoClose: 1100,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };
    const handleStatus = async function (id, is_active) {
        console.log(id, is_active);
        const token = localStorage.getItem('admintoken')
        const data = {
            id: id,
            request_type: Number(!is_active)
        }

        try {
            const result = await axios.patch(`http://83.136.219.147:4000/v1/api/admin/activateDeactivateBlogCategory/${id}`, data, {
                headers: {
                    Authorization: token
                }
            }
            )
            if (result.status === 200) {
                console.log(result, "result :")
                notify(result.data.message);
                fetchData()
            }
            else {
                alert("Some error occurred")
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleChangeStatus = (e) => {
        setStatus_val(e.target.value);
        console.log(status_val);
        const st = Number(status_val);
        tabledata.filter((val) => {
            // console.log(val.is_active)
            if (status_val === '') {
                // return setTabledata(tabledata.push(val));
                console.log(val);
                // console.log(tabledata.push(val));
            }
            else if (val.is_active === st) {
                // return setTabledata([val])
                console.log(val);
            }
            else {
                // return setTabledata([val]);
                console.log(val);
            }
        })
    }

    return (
        <>
            {open ? <Popup notify={notify} submitUpdate={submitUpdate} edit={edit} setOpen={setOpen} open={open} /> : ''}
            <ToastContainer
                position="top-center"
                autoClose={1100}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className='toast_pop'
            />
            <Navbar />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '90%', margin: 'auto', my: 2 }}>
                <TextField className='search_field' id="standard-basic" value={search} onChange={(e) => setSearch(e.target.value)} label="Search..." variant="standard" />
                <Box sx={{ mt: 1 }}>
                    <Button variant='contained' sx={{ mr: 1 }} onClick={() => setAddopen(true)}>Add</Button>
                    {addopen ? <Addpopup notify={notify} alert={alert} tabledata={tabledata} setTabledata={setTabledata} setAddopen={setAddopen} addopen={addopen} /> : ''}
                    {/* <InputLabel id="demo-simple-select-label">Status</InputLabel> */}
                    <FormControl className='dropdown_link' sx={{ mx: 1 }}>
                        <Select
                            value={status_val}
                            onChange={handleChangeStatus}
                            displayEmpty
                            className='selector'
                        // label='Status'
                        >
                            <MenuItem value="">
                                <em>Status</em>
                            </MenuItem>
                            <MenuItem value="1">
                                Active
                            </MenuItem>
                            <MenuItem value='0'>In Active</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <div className='list_main'>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead className='table_head'>
                            <TableRow>
                                {headData.map((column) => (
                                    <TableCell align='center'
                                        key={column.id}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {tabledata.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).filter((val) => {
                                if (search === '') {
                                    return val
                                }
                                else if (val.name.toLowerCase().includes(search.toLowerCase())) {
                                    return val
                                }
                            }).map((row) => {
                                return (
                                    <TableRow hover tabIndex={-1} key={row.id}>
                                        <TableCell align="center">
                                            {row.id}
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button variant='contained' color='primary' disabled>{row.is_active === 1 ? 'active' : 'inactive'}</Button>

                                        </TableCell>
                                        <TableCell align='center' className='action_btn' sx={{ my: 'auto' }}>
                                            {row.is_active !== 0 ? <Button variant='contained' onClick={() => {
                                                setEdit({ id: row.id, name: row.name }); setOpen(true);
                                            }}>
                                                Edit</Button> : ''}

                                            <Button variant='contained' sx={{ ml: 2 }} color='primary' onClick={() => handleStatus(row.id, row.is_active)}>{row.is_active === 1 ? 'Not Active' : 'Acitve'} </Button>

                                        </TableCell>

                                        {/* {headData.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} >
                                                    {column.format && typeof value === 'string' ? column.format(value) : value}
                                                </TableCell>
                                            );
                                        })} */}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box className=''>
                    <TablePagination
                        rowsPerPageOptions={[]}
                        component="div"
                        count={tabledata.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ width: '100%' }}
                    />
                </Box>

            </div>
        </>
    );
}
