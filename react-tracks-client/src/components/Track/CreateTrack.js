import React, { useState } from "react";

import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";

import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { from } from "zen-observable";

import { GET_TRACKS_QUERY } from "../../pages/App";

import Error from "../Shared/Error";

import axios from "axios";


const CreateTrack = ({ classes }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError ] = useState("")

  const handleAudioChange = event => {
    const fileSizeLimit = 5000000; // 4.5 mb
    const selectedFile = event.target.files[0];
    if(selectedFile && selectedFile.size > fileSizeLimit)
    {
      setFile("")
      setFileError(`${selectedFile.name} : File size too large !!`);
    }
    else{
      setFile(selectedFile);
      setFileError('')
    }
    
  };


  const handleAudioUpload = async () => {
    try {
      const data = new FormData();

      data.append("file", file);
      data.append("resource_type", "raw");
      data.append("upload_preset", "react-tracks");
      data.append("cloud_name", "coding-brains");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/coding-brains/raw/upload",
        data
      );

      return res.data.url;
    } catch (err) {
      console.log("Error Uploading audio file to cloudinary => ", err);
      setSubmitting(false);
    }
  };

  const handleUpdateCache = (cache, {data: { createTrack }}) => {

    const data = cache.readQuery({ query : GET_TRACKS_QUERY });
    const tracks = data.tracks.concat(createTrack.track)
    cache.writeQuery({ query: GET_TRACKS_QUERY, data : { tracks }})

  }


  const handleSubmit = async (event, createTrack) => {
    setSubmitting(true);

    event.preventDefault(); // prevent reloading and postback when form is submitted
    // upload our audio file, get returned url from API

    const uploadedUrl = await handleAudioUpload();
    createTrack({
      variables: {
        title,
        description,
        url: uploadedUrl
      }
    });
  };

  return (
    <>
      {/* Create track Button */}
      <Button
        onClick={() => setOpen(true)}
        variant="fab"
        className={classes.fab}
        color="secondary"
      >
        {open ? <ClearIcon /> : <AddIcon />}
      </Button>

      {/* Create track Dialog */}

      <Mutation
        mutation={CREATE_TRACK_MUTATION}
        onCompleted={data => {
          console.log({ data });
          setSubmitting(false);
          setOpen(false);
          setTitle("")
          setDescription("")
          setFile("")
        }}

        update ={
          handleUpdateCache
        }


        // refetchQueries={() => [
        //   {
        //     query: GET_TRACKS_QUERY
        //   }
        // ]}
      >
        {(createTrack, { loading, error }) => {
          if (error) return <Error error={error} />;

          return (
            <Dialog open={open} className="classes.dialog">
              <form onSubmit={event => handleSubmit(event, createTrack)}>
                <DialogTitle>Create Track</DialogTitle>

                <DialogContent>
                  <DialogContentText>
                    Add a Title, Description, & Audio File(Under 10 mb)
                  </DialogContentText>

                  <FormControl fullWidth>
                    <TextField
                      onChange={event => setTitle(event.target.value)}
                      label="Title"
                      placeholder="Add Title"
                      className={classes.textField}
                      value={title}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <TextField
                      onChange={event => setDescription(event.target.value)}
                      rows="2"
                      multiline
                      label="Description"
                      placeholder="Add Description"
                      className={classes.textField}
                      value={description}
                    />
                  </FormControl>

                  <FormControl error={Boolean(fileError)}>
                    <input
                      onChange={handleAudioChange}
                      id="audio"
                      required
                      type="file"
                      accept="audio/mp3,audio/wav"
                      className={classes.input}

                    />
                    <label htmlFor="audio">
                      <Button
                        variant="outlined"
                        color={file ? "secondary" : "inherit"}
                        component="span"
                        className={classes.button}
                      >
                        Audio File
                        <LibraryMusicIcon className={classes.icon} />
                      </Button>
                      
                      {file && file.name}
                      <FormHelperText>{fileError}</FormHelperText>

                    </label>
                  </FormControl>
                </DialogContent>

                <DialogActions>
                  <Button
                    disabled={submitting}
                    onClick={() => setOpen(false)}
                    className={classes.cancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      submitting || !title.trim() || !description || !file
                    }
                    className={classes.save}
                  >
                    {submitting ? (
                      <CircularProgress className={classes.save} size={24} />
                    ) : (
                      "Add Track"
                    )}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          );
        }}
      </Mutation>
    </>
  );
};

const CREATE_TRACK_MUTATION = gql`
  mutation($title: String!, $description: String!, $url: String!) {
    createTrack(title: $title, description: $description, url: $url) {
      track {
        id
        title
        description
        url
        likeSet {
          id
        }
        postedBy {
          id
          username
        }
      }
    }
  }
`;

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200"
  }
});

export default withStyles(styles)(CreateTrack);
