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
import { zip } from 'rxjs';
import { saveAs } from 'file-saver';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { resetWarningCache } from 'prop-types';

var JSZip = require('jszip');
var JSZipUtils = require('jszip-utils');

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
    value: 'Paper',
    text: 'Paper',
  },
  {
    value: 'Metal',
    text: 'Metal',
  },
  {
    value: 'Stone',
    text: 'Stone',
  },
  {
    value: 'Wood',
    text: 'Wood',
  },
  {
    value: 'Fabric',
    text: 'Fabric',
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

const IP = '172.20.79.104';
const PORT = 8501;
const MODEL_NAME = 'tsgan_gdwct';
const endpoint =
  'http://' + IP + ':' + PORT + '/v1/models/' + MODEL_NAME + ':predict';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: null,
      b64: null,
      loading: false,
      currentImgSrc: null,
      imgSrc: null,
      myList: [],
      mySrcs: [],
      resize: false,
      mode: null,
      imgMode: null,
      inputSrc: null,
      nSamples: null,
      textures: [],
      alpha: null,
      styleTransfer: 0,
      generated: [],
      genDict: {},
      progress: 0,
      keepHistory: false,
    };

    this.onImage = this.onImage.bind(this);
    this.loadData = this.loadData.bind(this);
    this.addToList = this.addToList.bind(this);
    this.removeFromList = this.removeFromList.bind(this);
    this.clearList = this.clearList.bind(this);
    this.saveList = this.saveList.bind(this);
    this.toggleResizeSelect = this.toggleResizeSelect.bind(this);
    this.toggleHistory = this.toggleHistory.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.generate = this.generate.bind(this);
    this.resize = this.resize.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  loadData(jsonResponse) {
    this.log('Received TF data');
    this.log('Loading received images');
    var obj = JSON.parse(jsonResponse);
    var data = obj['predictions'].map(
      prediction =>
        'data:image/png;base64,' +
        prediction.replace(/-/g, '+').replace(/_/g, '/')
    );
    var genDict = {};
    for (const texture of this.state.textures) {
      var splice = data.splice(0, this.state.nSamples);
      genDict[texture] = splice;
    }

    var prevGenDict = this.state.genDict;
    if (Object.keys(prevGenDict)) {
      for (const texture of Object.keys(genDict)) {
        if (prevGenDict[texture]) {
          prevGenDict[texture].push(...genDict[texture]);
        } else {
          prevGenDict[texture] = genDict[texture];
        }
      }
    }

    this.setState({
      genDict: prevGenDict,
      loading: false,
      progress: 100,
    });
  }

  onImage(e, { value }) {
    const inputMode = this.state.mode;
    const inputSrc = this.state.inputSrc;
    URL.revokeObjectURL(this.state.imgSrc);

    this.setState({
      imgSrc: inputSrc,
      imgMode: inputMode,
    });
  }

  log(string) {
    var logDiv = document.getElementById('log');
    logDiv.innerHTML += string + '<br>';
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  async resize(height = 256, width = 256) {
    this.log('Validating form inputs');

    try {
      this.formValidation();
    } catch (err) {
      this.log(err);
      this.setState({
        loading: false,
      });
      return;
    }

    this.log('Done');
    this.log('Resizing and converting input image');

    var url;
    if (this.state.imgMode === fileInputs.properties[fileInputs.URL].name) {
      url = '/api/proxy/' + this.state.imgSrc;
    } else if (
      this.state.imgMode === fileInputs.properties[fileInputs.image].name
    ) {
      url = this.state.imgSrc;
    } else {
      throw new Error("This really shouldn't be happening.");
    }
    this.log('Created img url');

    const img = new Image();
    img.onload = () => {
      var canvas = document.createElement('CANVAS');

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      var data = canvas.toDataURL().substring('data:image/png;base64,'.length);
      this.setState({
        b64: data,
        progress: 40,
      });
      this.log('Set B64, Done');
      this.sendData();
    };

    img.src = url;

    img.onerror = err => {
      this.log(
        'Error processing image for generation; perhaps try another image source?'
      );
    };

    this.log('Set new image, waiting for onload');
    this.setState({
      progress: 0,
    });
  }

  checkWidth() {
    this.log('sanity check width');
    var i = new Image();
    i.onload = function() {
      alert(i.width + ', ' + i.height);
    };
    i.src = 'data:image/png;base64,' + this.state.b64;
  }

  formValidation() {
    if (
      !(
        this.state.nSamples &&
        this.state.textures &&
        this.state.imgSrc &&
        this.state.alpha
      )
    ) {
      // alert ('Enter all required parameters: number of samples, textures, and alpha.')
      throw new Error(
        'Enter all required parameters: number of samples, textures, and alpha.'
      );
    } else if (this.state.alpha < 0) {
      throw new Error('Below minimum alpha (0.0)');
    } else if (this.state.alpha > 2) {
      throw new Error('Above maximum alpha (2.0)');
    }
  }

  async sendData() {
    this.log('Sending data to TF serving endpoint');
    const b64 = this.state.b64;

    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            input_real_img_bytes: { b64: this.state.b64 },
            input_n_style: this.state.nSamples,
            input_do_gdwct: this.state.styleTransfer,
            input_alpha: this.state.alpha,
            input_categories: this.state.textures.map(texture =>
              texture.toLowerCase()
            ),
          },
        ],
      }),
    })
      .then(function(data) {
        return data.json();
      })
      .then(response => this.loadData(response))
      .then(
        this.setState({
          progress: 60,
        })
      )
      .catch(err => this.log(err));
  }

  async generate() {
    this.log('GENERATING IMAGES');
    if (this.state.keepHistory) {
      this.setState({
        loading: true,
      });
    } else {
      this.setState({
        genDict: {},
        loading: true,
      });
    }

    this.resize();

    // let a = await resize(this.state.imgSrc);
    // this.setState({
    //   b64: a,
    // });
    // this.sendData();
    // return resize(this.state.imgSrc).then(() => {
    //   return this.sendData();
    // })
  }

  onImageClick(e) {
    this.setState({
      currentImgSrc: e.target.src
        ? [e.target.src, e.target.parentNode.id]
        : nullImg,
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
    const mySrcs = this.state.mySrcs;
    const currentImgSrc = this.state.currentImgSrc;
    const position = mySrcs.indexOf(currentImgSrc[0]);

    if (position < 0) {
      mySrcs.push(currentImgSrc[0]);
      myList.push(currentImgSrc[1]);
      this.setState({
        mySrcs: mySrcs,
        myList: myList,
      });
    } else {
      alert('Image already added');
    }
  }

  removeFromList() {
    const mySrcs = this.state.mySrcs;
    const myList = this.state.myList;
    const currentImgSrc = this.state.currentImgSrc;
    const position = mySrcs.indexOf(currentImgSrc[0]);

    if (position < 0) {
      alert('Image not in list');
    } else {
      mySrcs.splice(position, 1);
      myList.splice(position, 1);
      this.setState({
        mySrcs: mySrcs,
        myList: myList,
      });
    }
  }

  clearList() {
    this.setState({
      mySrcs: [],
      myList: [],
    });
  }

  saveList() {
    const myList = this.state.mySrcs.map((url, i, arr) => {
      return {
        download: url[0],
        filename: this.state.myList[i],
      };
    });

    var zip = new JSZip();
    var count = 0;
    var zipFilename = 'myList.zip';

    myList.forEach(function(url) {
      var filename = url.filename + '.png';

      JSZipUtils.getBinaryContent(url.download, function(err, data) {
        if (err) {
          throw err;
        }

        zip.file(filename, data, { binary: true });
        count++;

        if (count == myList.length) {
          var zipFile = zip
            .generateAsync({ type: 'blob' })
            .then(function(content) {
              saveAs(content, zipFilename);
            });
        }
      });
    });
  }

  toggleResizeSelect(e) {
    this.setState({
      resize: !this.state.resize,
    });
  }

  toggleHistory(e) {
    this.setState({
      keepHistory: !this.state.keepHistory,
    });
  }

  setNSamples(e) {
    const nSamples = e.target.value;
    if (!nSamples) {
      this.setState({
        nSamples: null,
      });
    } else if (nSamples > 25 || nSamples < 1) {
      alert(
        'Number of Samples entered out of bounds (1 - 25). Please reenter.'
      );
      e.target.value = this.state.nSamples;
      // throw new Error('Number of Samples entered out of bounds (1 - 25)');
    } else {
      if (e.target.value != parseInt(e.target.value)) {
        alert('Please input a whole number');
        e.target.value = parseInt(e.target.value);
      }

      this.setState({
        nSamples: parseInt(e.target.value),
      });
    }
  }

  setAlpha(e) {
    const alpha = e.target.value;
    if (!alpha) {
      this.setState({
        alpha: null,
      });
    } else if (alpha > 2 || alpha < 0) {
      alert(
        'Number of Samples entered out of bounds (0.0 - 2.0). Please reenter.'
      );
      e.target.value = this.state.alpha;
      // throw new Error('Number of Samples entered out of bounds (1 - 25)');
    } else {
      this.setState({
        alpha: parseFloat(e.target.value),
      });
    }
  }

  async inputChange(e) {
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
          <div style={{ height: 191.8, width: 191.8, padding: 10 }}>
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
            onClick={this.generate}
            loading={this.state.loading}
            disabled={this.state.loading}
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
                marginBottom: '10px',
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
          <div
            style={{
              flex: '0 1 0',
              display: 'flex',
              padding: 10,
              ...borderStyle,
            }}
          >
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
                max="25"
                min="1"
                onChange={e => this.setNSamples(e)}
                disabled={this.state.loading}
              />
              <Checkbox
                label="Keep history"
                style={{ marginBottom: '10px' }}
                onChange={this.toggleHistory}
                disabled={this.state.loading}
              />
              <Checkbox label="Sort by color" />
            </div>
            <div style={controlColumnStyle}>
              {/* <Header as="h4">Translation Model</Header>
              <select options={['modelA', 'modelB']} /> */}
              <Header as="h4" style={{ marginTop: '0px' }}>
                Texture Transfer
              </Header>
              <Dropdown
                multiple
                selection
                fluid
                clearable
                options={textureOptions}
                onChange={(e, { value }) => this.setState({ textures: value })}
                placeholder="Select texture/s"
                disabled={this.state.loading}
              />
              <Header as="h4" style={{ marginTop: '10px' }}>
                Alpha
              </Header>
              <Input
                style={{ maxWidth: 100, marginBottom: 10 }}
                type="number"
                step="0.25"
                max="2"
                min="0"
                onChange={e => this.setAlpha(e)}
                disabled={this.state.loading}
              />
            </div>
            <div style={controlColumnStyle}>
              <Header as="h4"> Style Transfer</Header>
              <Select
                options={styleOptions}
                defaultValue={0}
                onChange={(e, { value }) =>
                  this.setState({ styleTransfer: value })
                }
                disabled={this.state.loading}
              />
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
          <div
            style={{
              flex: '0 1 0',
              justifyContent: 'flex-end',
              marginTop: '10px',
            }}
          >
            <Header as="h5">Progress Status </Header>
            <div style={{ marginBottom: '0px' }}>
              <Progress
                percent={this.state.progress}
                progress
                style={{ marginBottom: '0px' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderListItems() {
    const size = 75;
    return this.state.mySrcs.map(url => (
      <div
        style={{ width: size, height: size, padding: 5 }}
        onClick={e => this.onImageClick(e)}
      >
        <img style={stretchStyle} src={url} key={url} />
      </div>
    ));
  }

  renderCategory(list, key) {
    const size = 150;
    return list.map((url, index) => (
      <div
        style={{ width: size, height: size, padding: 5 }}
        onClick={e => this.onImageClick(e)}
        id={key + index}
      >
        <img
          style={stretchStyle}
          src={url}
          key={url}
          id={url}
          alt={'load fail'}
        />
      </div>
    ));
  }

  renderGridItems() {
    return Object.keys(this.state.genDict).map((key, index) => (
      <div>
        <Header as="h4" style={{ textAlign: 'center' }}>
          {key}
        </Header>
        <div
          style={{
            flex: 1,
            ...gridStyle,
            margin: 5,
            display: 'flex',
            overflowY: 0,
            borderBottom: 'solid 1px #ccc',
          }}
        >
          {' '}
          {this.renderCategory(this.state.genDict[key], key)}
        </div>
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
                this.state.currentImgSrc ? this.state.currentImgSrc[0] : nullImg
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
        <div
          style={{
            flex: 1,
            ...gridStyle,
            margin: 5,
            ...borderStyle,
            flexWrap: 0,
            flexDirection: 'column',
            placeContent: 'start',
          }}
        >
          {this.renderGridItems()}
        </div>
      </div>
    );
  }

  render() {
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
        <div
          style={{
            flex: '1 1 0',
            overflowY: 'auto',
            margin: 5,
            ...borderStyle,
            maxHeight: '100px',
          }}
          id="log"
        />
      </div>
    );
  }
}

export default App;
