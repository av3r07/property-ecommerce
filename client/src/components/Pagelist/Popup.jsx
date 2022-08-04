import { Box, Button, Grid, ListItem, Modal, TextField, Typography } from '@mui/material'
import React from 'react'
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

const stylee = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function Popup(props) {
  console.log(props)
  const [name, setName] = useState(props.edit.name);
  const [author, setAuthor] = useState(props.edit.author);
  const [description, setDescription] = useState(props.edit.description);
  const [image, setImage] = useState(props.edit.image);
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async function () {
    const data = {
      id: props.edit.id,
      name: name
    }
    const token = localStorage.getItem('admintoken')
    try {
      const result = await axios.put(`http://83.136.219.147:4000/v1/api/admin/editBlogCategory/${props.edit.id}`, data, {
        headers: {
          Authorization: token
        }
      }
      )
      console.log("result :", result);
      if (result.status === 200) {
        props.notify("data edit successfully");
        props.submitUpdate()
        props.setOpen(false)
      }
      else {
        alert("username or password is incorrect")
      }
    } catch (err) {
      console.log(err);
      alert("please enter correct username or password");
    }
  };
  const handleEditBlogSubmit = async function (e) {
    e.preventDefault();
    const token = localStorage.getItem('admintoken')
    // var bodyFormData = new FormData();
    // bodyFormData.set('name', name);
    // bodyFormData.set('author', author);
    // bodyFormData.set('description', description);
    // bodyFormData.set('category_id', props.edit.category_id);
    // bodyFormData.append('id', props.edit.id);
    const bodyFormData = {
      name: name,
      author: author,
      image: image,
      description: description,
      category_id: props.edit.id
    }

    axios({
      method: "post",
      url: `http://83.136.219.147:4000/v1/api/admin/editBlog/${props.edit.id}`,
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
    console.log(e.target.files[0]);
    setImage(e.target.files[0])
    console.log("handleChangeImage");
  }
  const handleClose = () => {
    props.submitUpdate({
      id: props.edit.id,
      name: props.edit.name
    }
    );
    props.setOpen(false)
  }
  // if (props.type === 'blog') {
  //   <div className='madal_main'>
  //     <Modal
  //       open={props.open}
  //       onClose={handleClose}
  //       aria-labelledby="modal-modal-title"
  //       aria-describedby="modal-modal-description"
  //       className='modal_div_add'
  //     >
  //       {/* <form onSubmit={handlSubmit}> */}
  //       <Box sx={styl} className='modal_box' component="form"
  //         noValidate
  //         autoComplete="off">
  //         <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 2 }}>
  //           <Typography sx={{ mb: 4, fontWeight: 500 }} color='black'>Create New Blogs</Typography>
  //           <CloseSharpIcon onClick={handleClose} sx={{ backgroundColor: '#2196f3', cursor: 'pointer' }} />
  //         </Box>
  //         <Grid container spacing={2} columns={16}>
  //           {/* <Grid item xs={16} md={8} lg={8}>
  //             <div className='preview_img'>
  //               <img src={image} alt='img' id='img' className='img_view' />
  //             </div>
  //             <input
  //               onChange={handleChangeImage}
  //               type="file"
  //               id='input'
  //             />
  //           </Grid> */}
  //           <Grid item xs={16} md={8} lg={8}>
  //             <TextField className='typo' id="standard-basic" value={name} onChange={(e) => setName(e.target.value)} label="Name" variant="standard" />
  //           </Grid>
  //           <Grid item xs={16} md={8} lg={8}>
  //             <TextField className='typo' id="author" value={author} onChange={(e) => setAuthor(e.target.value)} label="City" variant="standard" />
  //           </Grid>
  //           <Grid item xs={16} md={8} lg={8}>
  //             <TextField className='typo' id="standard-basic" value={props.edit.category_id} label="Category" variant="standard" />
  //           </Grid>
  //           <Grid item xs={16} md={8} lg={8}>
  //             <TextField className='typo' id="standard-basic" value={description} label="description" onChange={(e) => setDescription(e.target.value)} variant="standard" />
  //           </Grid>
  //         </Grid>
  //         <Box className='modal_action'>
  //           <Button
  //             type="submit"
  //             variant="contained"
  //             color="primary"
  //             onClick={handleEditBlogSubmit}>Save</Button>
  //         </Box>
  //       </Box>
  //     </Modal>
  //   </div>
  // }
  return (
    <div className='madal_main'>
      <Modal
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className='modal_div'
      >
        <Box sx={stylee} className='modal_box'>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 2 }}>
            <Typography sx={{ mb: 4, fontWeight: 500 }} color='black'>Edit Details</Typography>
            <CloseSharpIcon onClick={handleClose} sx={{ backgroundColor: '#2196f3', cursor: 'pointer' }} />
          </Box>
          <Grid container spacing={2} columns={16}>
            <Grid item xs={16} md={16} lg={16}>
              <TextField className='typo' id="standard-basic" value={name} onChange={(e) => setName(e.target.value)} label="Name" variant="standard" />
            </Grid>
            {/* <Grid item xs={16} md={8} lg={8}>
              <TextField className='typo' id="city" value={city} onChange={(e) => setCity(e.target.value)} label="City" variant="standard" />
            </Grid>
            <Grid item xs={16} md={8} lg={8}>
              <TextField className='typo' id="standard-basic" value={surname} onChange={(e) => setSurname(e.target.value)} label="Surname" variant="standard" />
            </Grid>
            <Grid item xs={16} md={8} lg={8}>
              <TextField className='typo' id="standard-basic" value={props.edit.id} label="ID" variant="standard" />
            </Grid> */}
          </Grid>
          <Box className='modal_action'>
            <Button variant='contained' sx={{ mx: 2 }} onClick={handleSubmit} >Save</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}
