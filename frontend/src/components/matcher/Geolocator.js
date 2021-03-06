import React, { Component, Fragment } from "react";
import { Modal, Button } from "react-bootstrap";

export class Geolocator extends Component {
  state = {
    modalShow: true,
  };

  understood = () => {
    this.setState({ modalShow: false });
  };

  render() {
    const { modalShow } = this.state;
    return (
      <Fragment>
        <Modal
          data-test="geolocator"
          show={modalShow}
          onHide={this.understood}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Allow us to find you!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              In order to let us find you, please accept the following browser
              pop-up
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.understood}>Understood</Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    );
  }
}

export default Geolocator;
