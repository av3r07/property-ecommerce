import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Button, TablePagination, TextField } from '@mui/material';
import Popup from './Popup';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import Addpopup from './Addpopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const headData = [
  // {
  //     id: 'ID',
  //     label: 'ID',
  //     format: (value) => value.toLocaleString(),
  // },
  {
    id: 'id',
    label: 'ID',
    format: (value) => value.toLocaleString(),
  }, {
    id: 'name',
    label: 'Name',
    format: (value) => value.toLocaleString(),
  },
  {
    id: 'author',
    label: 'Author',
    format: (value) => value.toLocaleString(),
  },
  {
    id: 'description',
    label: 'Description',
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

export default function Blogpagelist(props) {
  const [open, setOpen] = useState(false);
  const [addopen, setAddopen] = useState(false);
  const [search, setSearch] = useState('')
  const [edit, setEdit] = useState({ id: null, name: '', author: '', description: '' });
  const [tabledata, setTabledata] = useState([])
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(2);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const submitUpdate = value => {
    updateTabledata(edit.id, value);
    setEdit({
      id: null, name: '', surname: '', city: '', field: ''
    });
  };

  const updateTabledata = (todoId, newValue) => {
    setTabledata(prev => prev.map(item => (item.id === todoId ? newValue : item)));
  };

  const handleStatus = async function (id, is_active) {
    console.log(id, is_active);
    const token = localStorage.getItem('admintoken')
    const data = {
      id: id,
      request_type: Number(!is_active)
    }
    console.log(data, token);
    try {
      const result = await axios.patch(`http://83.136.219.147:4000/v1/api/admin/activateDeactivateBlog/${id}`, data, {
        headers: {
          Authorization: token
        }
      }
      )
      if (result.status === 200) {
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

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    const token = localStorage.getItem('admintoken')
    axios.post('http://83.136.219.147:4000/v1/api/admin/fetchBlogs', {},
      {
        headers: {
          Authorization: token
        }
      }
    )
      .then(function (response) {
        setTabledata(response.data.data)
        console.log(response.data.data)
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
      });
  }

  const notify = () => {
    toast.success(' Wow so easy!', {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
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
      />
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', margin: 'auto', my: 2 }}>
        <TextField className='typ' id="standard-basic" value={search} onChange={(e) => setSearch(e.target.value)} label="Search..." variant="standard" sx={{ width: '50%' }} />
        <Button variant='contained' onClick={() => setAddopen(true)}>Add</Button>
        {addopen ? <Addpopup notify={notify} type='add_blog' tabledata={tabledata} setTabledata={setTabledata} setAddopen={setAddopen} addopen={addopen} /> : ''}
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
                if (search = '') {
                  return val
                }
                else if (val.name.toLowerCase().includes(search.toLowerCase())) {
                  return val
                }
              }).map((row) => {
                return (
                  <TableRow hover tabIndex={-1} key={row.id}>
                    <TableCell align="right">
                      {row.id}
                    </TableCell>
                    <TableCell align="left">
                      {row.name}
                    </TableCell>
                    <TableCell align="left">{row.author}</TableCell>
                    <TableCell align="left">{row.description}</TableCell>
                    <TableCell align="left">
                      {row.is_active === 1 ? <><Button variant='contained' color='primary' disabled>Deactivate</Button></> : <Button variant='contained' color='primary' disabled>Activate</Button>
                      }
                    </TableCell>
                    <TableCell className='action_btn' sx={{ my: 'auto' }}>
                      {/* <Button variant='contained' onClick={() => {
                      setEdit({ id: row.id, name: row.name, surname: row.surname, field: row.field, city: row.city, action: row.action }); setOpen(true)
                    }}>
                      {row.action}</Button>
                      {row.is_active ? <Popup type='blog' notify={notify} submitUpdate={submitUpdate} edit={edit} setOpen={setOpen} open={open} /> : ''}

                      {status ? <Button variant='contained' sx={{ ml: 2 }} color='primary' onClick={() => (setStatus(!status), setStatusid({ id: row.id, value: row.city }))}>Not Activate</Button> : <Button variant='contained' sx={{ ml: 2 }} color='primary' onClick={() => (setStatus(!status), setStatusid({ id: row.id, value: row.city }))}>Activate</Button>} */}


                      {row.is_active !== 0 ? <Button variant='contained' onClick={() => {
                        setEdit({ id: row.id, name: row.name, author: row.author, description: row.description, category_id: row.category_id, image: row.image }); setOpen(true)
                      }}>
                        Edit</Button> : ''}
                      {open ? <Popup notify={notify} submitUpdate={submitUpdate} edit={edit} setOpen={setOpen} open={open} /> : ''}

                      <Button variant='contained' sx={{ ml: 2 }} color='primary' onClick={() => handleStatus(row.id, row.is_active)}>{row.is_active === 1 ? 'Not Active' : 'Acitve'} </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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

      </div>
    </>
  );
}
