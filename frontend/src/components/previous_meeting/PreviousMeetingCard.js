import React, { useState, Fragment } from "react";
import { Modal, Button } from "react-bootstrap";
import { connect } from "react-redux";

import About from "../meeting/About";
import PreviousChatCard from "./PreviousChatCard";

function PreviousMeetingCard(props) {
  const [showChat, setShowChat] = useState(false);
  const match = props.previousMatchesList
    ? props.previousMatchesList.get(props.show)
    : null;

  return match ? (
    <Fragment>
      <Modal
        show={props.show != null}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <h2>
              {(showChat ? "Chat history with " : "Previous Meeting with ") +
                match.get("first_name")}
            </h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Fragment>
            {showChat ? (
              <PreviousChatCard
                firstName={match.get("first_name")}
                matchId={match.get("match_id")}
              />
            ) : (
              <About
                username="no_value"
                aliveMeeting={false}
                commonTags={match.get("common_tags")}
              />
            )}
          </Fragment>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="info"
            onClick={() => {
              setShowChat(!showChat);
            }}
          >
            {showChat ? "Back to About" : "Show Chat"}
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setShowChat(false);
              props.onHide();
            }}
          >
            Hide
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  ) : (
    ""
  );
}

const mapStateToProps = (state) => ({
  previousMatchesList: state.getIn(["matcher", "previousMatches"]),
});

export default connect(mapStateToProps)(PreviousMeetingCard);
