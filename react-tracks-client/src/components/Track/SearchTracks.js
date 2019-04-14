import React,{ useState, useRef } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

import { ApolloConsumer } from "react-apollo";
import { gql } from "apollo-boost";

const SearchTracks = ({ classes, setSearchResults }) => {

  const [search, setSearch] = useState("");
  const inputEl = useRef()


  const clearSearchInput = () =>{

    setSearchResults([])
    setSearch("")
    inputEl.current.focus()

  }



  const handleSubmit = async (event, client) => {
    event.preventDefault();
    const res = await client.query({
      query: SEARCH_TRACK_QUERY,
      variables: {
          search
      }
    })


    console.log({res})
    setSearchResults(res.data.tracks)


  };

  return (
    <ApolloConsumer>
      {client => (
        <form onSubmit={event => handleSubmit(event, client)}>
          <Paper className={classes.root} elevation={1}>
            <IconButton onClick={clearSearchInput}>
              <ClearIcon />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Search All Tracks"
              InputProps={{
                disableUnderline: true
              }}
              value={search}
              inputRef={inputEl}
              onChange = {event => setSearch(event.target.value)}


            />

            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </Paper>
        </form>
      )}
    </ApolloConsumer>
  );
};

const SEARCH_TRACK_QUERY = gql`
  query($search: String) {
    tracks(search: $search) {
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
`;

const styles = theme => ({
  root: {
    padding: "2px 4px",
    margin: theme.spacing.unit,
    display: "flex",
    alignItems: "center"
  }
});

export default withStyles(styles)(SearchTracks);
