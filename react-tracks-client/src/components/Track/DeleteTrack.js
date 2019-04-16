import React, { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import TrashIcon from "@material-ui/icons/DeleteForeverOutlined";


import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";

import { UserContext } from '../../Root';
import { GET_TRACKS_QUERY } from "../../pages/App";

import Error from "../Shared/Error";




const DeleteTrack = ({tracks}) => {

  const currentUser = useContext(UserContext)
  const isCurrentUser = currentUser.id === tracks.postedBy.id




  return isCurrentUser && (
    <Mutation 
        mutation={DELETE_TRACK_MUTATION}
        variables = {{ trackId: tracks.id }}
        onCompleted= { data =>{
          console.log(data)
        }}

        refetchQueries={() => [
          {
            query: GET_TRACKS_QUERY
          }
        ]}
        >
        { (deleteTrack ,{ loading, error }) => (
          
          <IconButton onClick = { deleteTrack } >
            <TrashIcon/>
          </IconButton>
        )}
    </Mutation>
  
  );
};

const DELETE_TRACK_MUTATION = gql`

        mutation ($trackId: Int! ) {
          deleteTrack(trackId: $trackId ) {
            trackId
          }
        }

`

export default DeleteTrack;
