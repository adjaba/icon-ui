import React, { Component, Fragment } from 'react';
import {
  Button,
  Header,
  Form,
  Dropdown,
  List,
  Checkbox,
  Input,
  Select,
  Loader,
  Progress,
  Icon,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Slider } from 'react-semantic-ui-range';

import update from 'immutability-helper';
import { isThisISOWeek } from 'date-fns';

const sectionStyle = {
  flex: 1,
  borderRight: 'solid 1px #ccc',
  padding: '1em',
};
const borderStyle = {
  border: 'solid 1px #ccc',
};
const stretchStyle = {
  height: '100%',
  width: '100%',
};

const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  justifyContent: 'space-evenly',
  overflowY: 'auto',
};

// TODO: add options
const ocrEngineOptions = [
  {
    value: 'https://a.com',
    text: 'model A',
  },
  {
    value: 'https://b.com',
    text: 'model B',
  },
];

const textureOptions = [
  {
    value: 'textureA',
    text: 'paper',
  },
  {
    value: 'textureB',
    text: 'metal',
  },
];

const styleOptions = [
  {
    value: 0,
    text: 'No Style Transfer',
  },
  {
    value: 1,
    text: 'Game Style Transfer',
  },
];

const resizingOptions = [
  {
    value: 'nn',
    text: 'Nearest-neighbor',
  },
  {
    value: 'bl',
    text: 'Bilinear',
  },
  {
    value: 'lc',
    text: 'Lancoz',
  },
  {
    value: 'sr',
    text: 'Super-resolution',
  },
];
const controlColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const fakeData = [
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/6/6b/Acid_Spray_icon.png/120px-Acid_Spray_icon.png?version=d6e54c5791d2eaf135d30dd6796fa0c4',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/7/77/Activate_Fire_Remnant_icon.png/120px-Activate_Fire_Remnant_icon.png?version=d1cd7729ceec7e99160ada0bb6f28f02',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/e/ed/Adaptive_Strike_%28Agility%29_icon.png/120px-Adaptive_Strike_%28Agility%29_icon.png?version=eb5fc59ee73df5c6d64551ea949cad45',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/7/78/Adaptive_Strike_%28Strength%29_icon.png/120px-Adaptive_Strike_%28Strength%29_icon.png?version=6815d52085a862eae20a18e942f08830',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/b/b0/Adaptive_Strike_icon.png/120px-Adaptive_Strike_icon.png?version=c33e803c01639e5a8e0fd5cca1894f76',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/e/ed/Aegis_of_the_Immortal_ability_icon.png/120px-Aegis_of_the_Immortal_ability_icon.png?version=bba2b029164d54b02c05e92b62c105c3',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/f/f1/Aftershock_icon.png/120px-Aftershock_icon.png?version=dac54ad815bdc9e045835446f1e45800',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/6/60/Aghanim%27s_Scepter_ability_icon.png/120px-Aghanim%27s_Scepter_ability_icon.png?version=bff4644617b5ad823b5b912b8a787eef',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/1/1b/Alacrity_icon.png/120px-Alacrity_icon.png?version=4b5ee01ada72cfcec3f32b679240d040',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/6/63/Anchor_Smash_icon.png/120px-Anchor_Smash_icon.png?version=f1fc1e0824fdb3ac662a9591f9c6074e',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/0/06/Ancient_Seal_icon.png/120px-Ancient_Seal_icon.png?version=fe07db15d2407e459f5d399d39cdb230',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/b/b1/Aphotic_Shield_icon.png/120px-Aphotic_Shield_icon.png?version=70bf5692e4c125905955126aa4b6d3ec',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/e/ef/Arc_Lightning_icon.png/120px-Arc_Lightning_icon.png?version=02134fd5e2b0774772e67dd4b5cd7079',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/5/5a/Arcane_Aura_icon.png/120px-Arcane_Aura_icon.png?version=1900eebe7e3a0c00811798e049e279e9',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/3/3a/Arcane_Bolt_icon.png/120px-Arcane_Bolt_icon.png?version=8d6e441dded523a125436cdb3007d655',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/d/da/Arcane_Curse_icon.png/120px-Arcane_Curse_icon.png?version=0944e37a8522556dbbb8cabe79d2b4da',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/6/68/Arcane_Orb_icon.png/120px-Arcane_Orb_icon.png?version=3fb0d082d87f03a15519931ec2a258c5',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/0/09/Arcane_Rune_buff_icon.png/120px-Arcane_Rune_buff_icon.png?version=6dd7c315ebd1f916f3b41f62aa7ffb8d',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/e/ee/Arcane_Supremacy_icon.png/120px-Arcane_Supremacy_icon.png?version=c234a6e30cde75461f8a1d5ae6fd6bb0',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/0/01/Arctic_Burn_icon.png/120px-Arctic_Burn_icon.png?version=12f340b56e80296fae41f999b0f7360f',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/8/8c/Arena_Of_Blood_icon.png/120px-Arena_Of_Blood_icon.png?version=c31e57e633d558fcae1f026779df798c',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/8/81/Armor_Corruption_icon.png/120px-Armor_Corruption_icon.png?version=50bd7ae06b33f6d7d26ab57af322c645',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/1/16/Assassinate_icon.png/120px-Assassinate_icon.png?version=67782b02e7e9e1a3bc4c12f82749ab02',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/4/42/Assimilate_icon.png/120px-Assimilate_icon.png?version=3fccdcf42c4c1bcacf109adea020900c',
  'https://gamepedia.cursecdn.com/dota2_gamepedia/thumb/0/09/Astral_Imprisonment_icon.png/120px-Astral_Imprisonment_icon.png?version=6b00df85d6ba518740b43c1ac077b87f',
];

const nullImg = require('./images/null.JPG');

var fileInputs = {
  URL: 1,
  image: 2,
  properties: {
    1: { name: 'url', placeholder: 'Enter URL' },
    2: { name: 'file', accept: '.jpg, .jpeg, .png' },
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      bounds: null,
      zoom: -1,

      ocrEngine: ocrEngineOptions[0].value,
      filters: {
        english: true,
        korean: true,
        digit: true,
        special: true,
      },
      displaySettings: {
        rectangles: {
          checked: true,
          color: '#ffcc00',
        },
        annotations: {
          checked: false,
          color: '#333300',
        },
        coordinates: {
          checked: false,
          color: null,
        },
      },
      selectionResult: {
        word: '',
        xs: 0,
        ys: 0,
      },

      loading: false,
      data: {
        boundingBox: [],
        text_string: '',
      },

      currentImgSrc: null,
      imgSrc: null,
      myList: [],
      resize: false,
      mode: null,
      inputSrc: null,
    };

    this.onImage = this.onImage.bind(this);
    this.loadData = this.loadData.bind(this);
    this.loadFakeData = this.loadFakeData.bind(this);
    this.addToList = this.addToList.bind(this);
    this.removeFromList = this.removeFromList.bind(this);
    this.clearList = this.clearList.bind(this);
    this.saveList = this.saveList.bind(this);
    this.toggleResizeSelect = this.toggleResizeSelect.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  loadFakeData() {
    this.setState({
      data: update(this.state.data, {
        boundingBox: {
          $set: [], // TODO: fake data
        },
      }),
    });
  }

  async loadData() {
    const { url, ocrEngine } = this.state;
    this.setState({ loading: true });
    const resp = await fetch('/api/recognize', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // TODO: fix the format of the request body
        imageData: url,
        engine: ocrEngine,
      }),
    });

    const data = await resp.json();
    // TODO: fix the exact json response format
    this.setState({
      loading: false,
      data: data,
    });
  }

  onImage(e, { value }) {
    const inputSrc = this.state.inputSrc;
    URL.revokeObjectURL(this.state.imgSrc);

    this.setState({
      imgSrc: inputSrc,
    });
  }
  // onImage(e, {value}) {
  //   console.log('here');
  //   if (this.state.mode == fileInputs.properties[fileInputs.image].name){
  //     console.log('why am i here');
  //     if (e.target){
  //       const url = URL.createObjectURL(e.target.files[0]);
  //       const img = new Image();
  //       img.onload = () => {
  //         const { height, width } = img;

  //         const canvas = document.getElementById('temp-canvas');
  //         canvas.width = width;
  //         canvas.height = height;
  //         canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  //         const url = canvas.toDataURL();

  //         this.setState({
  //           url,
  //           height,
  //           width,
  //         });
  //       };
  //       img.src = url;
  //     }
  //   }
  //   else {
  //     console.log('onImage e.target', e.target);
  //     console.log('e', e);
  //     console.log('value', value);
  //     console.log('e.target.form', e.target.form);
  //     const formData = new FormData(e.target);
  //     console.log('formData', formData)
  //     this.setState({
  //       imgSrc: e.target.value,
  //     })
  //   }
  // }

  onImageClick(e) {
    this.setState({
      currentImgSrc: e.target.src ? e.target.src : nullImg,
    });
  }

  onImageError(e) {
    // TODO: add links between target.src and imgSrc?
    // Use case: what happens when invalid URL is entered after valid URL, is previous URL erased?
    e.target.src = nullImg;
    alert('Invalid input; please enter a valid image URL or file');
  }

  addToList() {
    const myList = this.state.myList;
    const currentImgSrc = this.state.currentImgSrc;
    const position = myList.indexOf(currentImgSrc);

    if (position < 0) {
      this.setState({
        myList: myList.concat(currentImgSrc),
      });
    } else {
      alert('Image already added');
    }
  }

  removeFromList() {
    const myList = this.state.myList;
    const currentImgSrc = this.state.currentImgSrc;
    const position = myList.indexOf(currentImgSrc);

    if (position < 0) {
      alert('Image not in list');
    } else {
      myList.splice(position, 1);
      this.setState({
        myList: myList,
      });
    }
  }

  clearList() {
    this.setState({
      myList: [],
    });
  }

  saveList() {}
  // onImageFocus(e){
  //   console.log(e);
  //   console.log('hi');
  // }

  toggleResizeSelect(e) {
    this.setState({
      resize: !this.state.resize,
    });
  }

  inputChange(e) {
    if (this.state.mode == fileInputs.properties[fileInputs.URL].name) {
      this.setState({
        inputSrc: e.target.value,
      });
    } else if (
      this.state.mode == fileInputs.properties[fileInputs.image].name
    ) {
      this.setState({
        inputSrc: URL.createObjectURL(e.target.files[0]),
      });
    }
  }
  renderControls() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            flex: '0 0 auto',
            width: 191.8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          <Button.Group
            size="small"
            style={{ margin: '10px 10px', maxHeight: '50px', flex: 1 }}
          >
            <Button
              onClick={() => {
                this.setState({
                  mode: fileInputs.properties[fileInputs.URL].name,
                });
              }}
            >
              <Icon name="linkify" />
              URL
            </Button>
            <Button.Or />
            <Button
              onClick={() => {
                this.setState({
                  mode: fileInputs.properties[fileInputs.image].name,
                });
              }}
            >
              <Icon name="upload" />
              Disk
            </Button>
          </Button.Group>
          <div
            style={{ height: 191.8, width: 191.8, padding: 10 }}
            id={'temp-canvas'}
          >
            <img
              onError={this.onImageError}
              style={stretchStyle}
              src={this.state.imgSrc ? this.state.imgSrc : nullImg}
            />
          </div>
          <Button
            type="submit"
            primary
            style={{ margin: '5px 10px', maxHeight: '50px', flex: 1 }}
          >
            Generate
          </Button>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            padding: 10,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Form
            method="post"
            encType="multipart/form-data"
            onSubmit={this.onImage}
          >
            <Form.Input
              action={
                <Button
                  color="blue"
                  labelPosition="left"
                  icon="image"
                  content="Load Image"
                />
              }
              actionPosition="right"
              style={{
                flex: 1,
                maxHeight: '36px',
                display: 'flex',
                alignItems: 'center',
              }}
              placeholder={
                this.state.mode
                  ? fileInputs.properties[1].placeholder
                  : 'Choose an input mode to the left'
              }
              type={this.state.mode || 'text'}
              disabled={!this.state.mode}
              onChange={e => this.inputChange(e)}
              accept={
                this.state.mode == fileInputs.properties[2].name
                  ? fileInputs.properties[2].accept
                  : '*'
              }
            />
          </Form>
          <div style={{ flex: '0 1 0', display: 'flex', padding: 10 }}>
            <div
              style={{
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: 'auto',
                width: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Header as="h4">Number of Samples</Header>
              <Input
                style={{ maxWidth: 100, marginBottom: 10 }}
                type="number"
                max="100"
                min="0"
              />
              <Checkbox label="Keep history" style={{ marginBottom: '10px' }} />
              <Checkbox label="Sort by color" />
            </div>
            <div style={controlColumnStyle}>
              {/* <Header as="h4">Translation Model</Header>
              <select options={['modelA', 'modelB']} /> */}
              <Header as="h4">Texture Transfer</Header>
              <Dropdown
                multiple
                selection
                fluid
                clearable
                options={textureOptions}
                placeholder="Select texture/s"
              />
            </div>
            <div style={controlColumnStyle}>
              <Header as="h4"> Style Transfer</Header>
              <Select options={styleOptions} defaultValue={0} />
              {/* <Header as="h4">Style Parameter</Header>
              <Slider
                color="blue"
                settings={{ start: 0, min: 0, max: 10, step: 1 }}
              /> */}
            </div>
            <div style={controlColumnStyle}>
              <Header as="h4">Post Processing</Header>
              <div style={{ marginLeft: '10px' }}>
                <Checkbox
                  label="Apply alpha channel"
                  style={{ marginBottom: '10px' }}
                />
                <Checkbox
                  label="Resize generated sample"
                  onChange={e => {
                    this.toggleResizeSelect(e);
                  }}
                />
              </div>
              <Select
                style={{ marginTop: 10 }}
                disabled={!this.state.resize}
                options={resizingOptions}
              />
            </div>
          </div>
          <div style={{ flex: '0 1 0', justifyContent: 'flex-end' }}>
            <Header as="h5">Progress Status </Header>
            <div style={{ marginBottom: '0px' }}>
              <Progress percent={50} progress style={{ marginBottom: '0px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderListItems() {
    const size = 75;
    return this.state.myList.map(url => (
      <div
        style={{ width: size, height: size, padding: 5 }}
        onClick={e => this.onImageClick(e)}
      >
        <img style={stretchStyle} src={url} key={url} />
      </div>
    ));
  }

  renderGridItems() {
    const size = 150;
    return fakeData.map(url => (
      <div
        style={{ width: size, height: size, padding: 5 }}
        onClick={e => this.onImageClick(e)}
        onFocus={() => console.log('hi')}
      >
        <img
          style={stretchStyle}
          src={url}
          key={url}
          id={url}
          alt={''}
          onFocus={() => {
            console.log('hi');
          }}
        />
      </div>
    ));
  }

  renderImages() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <div
          style={{
            flex: '0 0 auto',
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingBottom: 10,
          }}
        >
          <div style={{ padding: 10, flex: '0 0 auto' }}>
            <img
              style={stretchStyle}
              src={
                this.state.currentImgSrc ? this.state.currentImgSrc : nullImg
              }
            />
          </div>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <Button
              style={{ flex: 1 }}
              onClick={() => {
                this.removeFromList();
              }}
            >
              Remove
            </Button>
            <Button
              style={{ flex: 1 }}
              onClick={() => {
                this.addToList();
              }}
            >
              Add
            </Button>
          </div>
          <div
            style={{
              ...gridStyle,
              ...borderStyle,
              marginTop: 10,
              marginBottom: 5,
              flex: '1 1 auto',
            }}
          >
            {this.renderListItems()}
          </div>
          <div style={{ display: 'flex', flex: '0 0 auto' }}>
            <Button style={{ flex: 1 }} onClick={() => this.clearList()}>
              {' '}
              Clear list
            </Button>
            <Button style={{ flex: 1 }} onClick={() => this.saveList()}>
              Save list
            </Button>
          </div>
        </div>
        <div style={{ flex: 1, ...gridStyle, margin: 5, ...borderStyle }}>
          {this.renderGridItems()}
        </div>
      </div>
    );
  }

  render() {
    const { ocrEngine, data, selectionResult, displaySettings } = this.state;

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ flex: '0 0 auto' }}>{this.renderControls()}</div>
        <div style={{ flex: 1, minHeight: 0 }}>{this.renderImages()}</div>
      </div>
    );
  }
}

export default App;
