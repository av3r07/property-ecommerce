import { createSlice } from '@reduxjs/toolkit';


export const userSlice = createSlice({
    name: "user",
    alert: false,
    initialState: {
        user: {
            signed: false,
            data: ''
        },
    },
    reducers: {
        login: (state, action) => {
            state.user = {
                signed: true,
                data: action.payload
            }
        },
        logout: (state) => {
            state.user = {
                signed: false,
                data: null
            }
        },
        alert: (state, action) => {
            state.alert = true
        }
    }
});

export const { login, logout, alert } = userSlice.actions;

export const selectUser = (state) => state.user.user;

export default userSlice.reducer;