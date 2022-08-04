import React from 'react'
import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material'
import { useState } from 'react';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import axios from 'axios';


const styl = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    bgcolor: 'background.paper',
    // boxShadow: 24,
    p: 4,
    // mx:
};

export default function Addpopup(props) {
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [category_id, setCategory_id] = useState('')
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async function (e) {
        e.preventDefault();
        // props.handleAlert("sucess",'sucess')

        const token = localStorage.getItem('admintoken')
        const data = {
            name: name
        }
        const date = new Date()
        console.log('date', date.getSeconds());
        if (name === '') {
            setError(true);
        }
        else {
            try {
                const result = await axios.post('http://83.136.219.147:4000/v1/api/admin/addBlogCategory', data, {
                    headers: {
                        Authorization: token
                    }
                }
                )
                console.log("result :", result);
                if (result.status === 200) {
                    props.setTabledata([...props.tabledata, {
                        id: props.tabledata.length,
                        name: name,
                        action: 'Edit',
                        status: 'active'
                    }])
                    props.setAddopen(false)
                }
                else {
                    alert("username or password is incorrect")
                }
            } catch (err) {
                console.log(err.response.data);
                alert("please enter correct username or password");
            }
            setError(false);
        }
    }
    const handleClose = () => {
        props.setAddopen(false)
    }
    const handleBlogSubmit = async function (e) {
        e.preventDefault();
        const token = localStorage.getItem('admintoken')
        var bodyFormData = new FormData();
        bodyFormData.set('name', name);
        bodyFormData.set('author', author);
        bodyFormData.set('description', description);
        bodyFormData.set('category_id', category_id);
        bodyFormData.append('image', image);

        axios({
            method: "post",
            url: "http://83.136.219.147:4000/v1/api/admin/addBlog",
            data: bodyFormData,
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: token
            },
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (response) {
                console.log(response);
            });

        const date = new Date()
        if (name === '') {
        }
        else {
        }
    }
    const handleChangeImage = (e) => {
        // setImage(e.target.files[0])
        setImage(URL.createObjectURL(e.target.files[0]))
    }


    if (props.type === 'add_blog') {
        return (
            <div className='madal_main'>
                <Modal
                    open={props.addopen}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    className='modal_div_add'
                >
                    {/* <form onSubmit={handlSubmit}> */}
                    <Box sx={styl} className='modal_box' component="form"
                        noValidate
                        autoComplete="off">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 2 }}>
                            <Typography sx={{ mb: 4, fontWeight: 500 }} color='black'>Create New Blogs</Typography>
                            <CloseSharpIcon onClick={handleClose} sx={{ backgroundColor: '#2196f3', cursor: 'pointer' }} />
                        </Box>
                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-aroud' }}>
                            <div className='preview_img'>
                                <img src={image} alt='img' id='img' className='img_view' />
                                <input
                                    onChange={handleChangeImage}
                                    type="file"
                                    id='input'
                                hidden
                                />
                            </div>
                            <label htmlFor='input' className='labels' onClick={handleChangeImage}>Select Image</label>
                        </Box> */}
                        <Grid container spacing={4} columns={16}>
                            <Grid item xs={16} md={8} lg={8} sx={{ display: 'flex', justifyContent: 'space-aroud' }}>
                            <div className='preview_img'>
                                <img src={image} alt='img' id='img' className='img_view' />
                                <input
                                    onChange={handleChangeImage}
                                    type="file"
                                    id='input'
                                hidden
                                />
                            </div>
                            <label htmlFor='input' className='labels' onClick={handleChangeImage}>Upload</label>
                            </Grid>
                            <Grid item xs={16} md={8} lg={8}>
                                <TextField className='typo' id="standard-basic" value={name} onChange={(e) => setName(e.target.value)} label="Name" variant="standard" />
                            </Grid>
                            <Grid item xs={16} md={8} lg={8}>
                                <TextField className='typo' id="author" value={author} onChange={(e) => setAuthor(e.target.value)} label="City" variant="standard" />
                            </Grid>
                            <Grid item xs={16} md={8} lg={8}>
                                <TextField className='typo' id="standard-basic" value={category_id} onChange={(e) => setCategory_id(e.target.value)} label="Category" variant="standard" />
                            </Grid>
                            <Grid item xs={16} md={16} lg={16}>
                                <textarea className='textarea' id="standard-basic" value={description} placeholder="description" onChange={(e) => setDescription(e.target.value)} variant="standard" />
                            </Grid>
                        </Grid>
                        <Box className='modal_action'>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                // className={classes.submit}
                                onClick={handleBlogSubmit}>Save</Button>
                        </Box>
                    </Box>
                    {/* </form> */}
                </Modal>
            </div>
        )
    }
    return (
        <div className='madal_main'>
            <Modal
                open={props.addopen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className='modal_div_add'
            >
                {/* <form onSubmit={handlSubmit}> */}
                <Box sx={styl} className='modal_box' component="form"
                    noValidate
                    autoComplete="off">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 2 }}>
                        <Typography sx={{ mb: 4, fontWeight: 500 }} color='black'>Create More Details</Typography>
                        <CloseSharpIcon onClick={handleClose} sx={{ backgroundColor: '#2196f3', cursor: 'pointer' }} />
                    </Box>
                    <Box>
                        <TextField error={error}
                            helperText="Please Enter Name" className='typo' id="standard-basic" value={name} onChange={(e) => setName(e.target.value)} label="Enter Name" required variant="standard" />
                    </Box>
                    <Box className='modal_action'>
                        <Button
                            type="submit"
                            // fullWidth
                            variant="contained"
                            color="primary"
                            // className={classes.submit}
                            onClick={handleSubmit}>Save</Button>
                    </Box>
                </Box>
                {/* </form> */}
            </Modal>
        </div>
    )
}
