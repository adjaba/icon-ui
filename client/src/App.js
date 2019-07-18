import React, { Component } from 'react';
import {
  Button,
  Header,
  Form,
  Dropdown,
  Checkbox,
  Input,
  Select,
  Progress,
  Icon,
  Segment,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { saveAs } from 'file-saver';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

var JSZip = require('jszip');
var JSZipUtils = require('jszip-utils');

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
  justifyContent: 'flex-start',
  overflowY: 'auto',
};

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
    value: 'Rock',
    text: 'Rock',
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

// const styleOptions = [
//   {
//     value: 0,
//     text: 'No Style Transfer',
//   },
//   {
//     value: 1,
//     text: 'Game Style Transfer',
//   },
// ];

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
  padding: '5px',
};

const nullImg = require('./images/null.JPG');

const sliderMarks = {
  25: '0.25',
  50: '0.5',
  75: '0.75',
  100: '1',
  125: '1.25',
  150: '1.5',
  175: '1.75',
};

var fileInputs = {
  URL: 1,
  image: 2,
  properties: {
    1: { name: 'url', placeholder: 'Enter URL' },
    2: { name: 'file', accept: '.jpg, .jpeg, .png' },
  },
};

const vars = {
  0.0: 'final_out_alpha_0',
  1.0: 'final_out_alpha_1',
  2.0: 'final_out_alpha_2',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      b64: null, //base64 of resized most recently submitted image
      loading: false, // is generation ongoing
      currentImgSrc: null, // last clicked image source among grid and list for display
      currentImgName: null, // name of last clicked image source among grid and list. Format alpha+category+index
      imgSrc: null, // image source for generation
      myList: [], // contains images in side list. Structure [[img1, name], [img2, name]]
      resize: false, // resize generated samples option
      mode: null, // image upload mode: url or file (hence can be toggled with during image generation)
      imgMode: null, // generating image type: url or file
      inputSrc: null, // image source loaded from user through the load image button
      nSamples: 5, // number of samples per texture/ category selected by user
      textures: [], // textures/categories selected by user for image translation
      alpha: 0, // alpha value selected by user through slider for game style transfer
      genDict: {}, // generated instances from tensorflow serving api. Structure {alpha:{texture:[pic1, pic2]}}
      progress: 0, // progress bar
      keepHistory: false, // keep history attribute selected by user
      visible: textureOptions.map(option => option.text), // categories to be shown - toggled through show/hide buttons
      status: '', // status to be displayed beside progress bar
      lastClicked: null, // last selected image from list or grid (border for emphasis on select/unselect),
      showDict: Object(), // pictures to be shown in grid. Structure {texture:[pic1, pic2]}
    };

    this.onLoadImage = this.onLoadImage.bind(this);
    this.loadData = this.loadData.bind(this);
    this.addToList = this.addToList.bind(this);
    this.removeFromList = this.removeFromList.bind(this);
    this.clearList = this.clearList.bind(this);
    this.saveList = this.saveList.bind(this);
    this.toggleResizeSelect = this.toggleResizeSelect.bind(this);
    this.toggleHistory = this.toggleHistory.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.generate = this.generate.bind(this);
    this.resizeAndSend = this.resizeAndSend.bind(this);
    this.sendData = this.sendData.bind(this);
    this.filter = this.filter.bind(this);
    this.setAlpha = this.setAlpha.bind(this);
    this.generateShowDict = this.generateShowDict.bind(this);
  }

  // will be called after generate button is clicked or alpha has changed
  componentDidUpdate(prevProps, prevState) {
    const alpha = this.state.alpha;
    if (
      prevState['alpha'] !== alpha ||
      (prevState['loading'] !== this.state.loading &&
        this.state.loading === false)
    ) {
      this.generateShowDict(alpha).then(showDict => {
        if (alpha === this.state.alpha) {
          this.setState({
            showDict: showDict,
          });
        }
      });
    }
  }

  loadData(jsonResponse, vars) {
    this.log('Received TF data');
    this.log('Loading received images');

    var textures = this.state.textures;
    var nSamples = this.state.nSamples;
    var prevGenDict = this.state.genDict;

    var obj = JSON.parse(jsonResponse);
    var alphas = Object.keys(vars);

    alphas.forEach(function(alpha) {
      var rawData = obj['predictions'].map(
        predictionObject => predictionObject[vars[alpha]]
      );
      var data = rawData.map(
        prediction =>
          'data:image/png;base64,' +
          prediction.replace(/-/g, '+').replace(/_/g, '/')
      );

      var textureDict = {};

      for (const texture of textures) {
        var splice = data.splice(0, nSamples);
        textureDict[texture] = splice;
      }

      if (Object.keys(prevGenDict)) {
        for (const texture of Object.keys(textureDict)) {
          if (prevGenDict[alpha]) {
            if (texture in prevGenDict[alpha]) {
              prevGenDict[alpha][texture].push(...textureDict[texture]);
            } else {
              prevGenDict[alpha][texture] = textureDict[texture];
            }
          } else {
            prevGenDict[alpha] = {};
            prevGenDict[alpha][texture] = textureDict[texture];
          }
        }
      }
    });

    this.setState({
      genDict: prevGenDict,
      loading: false,
      progress: 100,
      status: 'Finished',
      visible: textureOptions.map(option => option.text),
    });
  }

  onLoadImage(e, { value }) {
    const inputMode = this.state.mode;
    const inputSrc = this.state.inputSrc;

    if (inputSrc !== this.state.imgSrc) {
      URL.revokeObjectURL(this.state.imgSrc);

      this.setState({
        imgSrc: inputSrc,
        imgMode: inputMode,
      });
    }
  }

  log(string) {
    this.setState({
      status: string,
    });
  }

  async resizeAndSend(height = 256, width = 256) {
    this.log('Validating form inputs');

    try {
      this.formValidation();
    } catch (err) {
      alert(err);
      this.setState({
        loading: false,
      });
      return;
    }

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
      var data = canvas
        .toDataURL('image/jpeg', 1.0)
        .substring('data:image/jpeg;base64,'.length);
      this.setState({
        b64: data,
        progress: 40,
      });
      this.log('Set B64, Done');
      this.sendData();
    };

    img.src = url;

    img.onerror = err => {
      console.log(err);
      alert(
        'Error processing image for generation; perhaps try another image source?'
      );
      this.setState({
        loading: false,
      });
    };

    this.log('Set new image, waiting for onload');
    this.setState({
      progress: 0,
    });
  }

  // checkWidth() {
  //   this.log('sanity check width');
  //   var i = new Image();
  //   i.onload = function() {
  //     alert(i.width + ', ' + i.height);
  //   };
  //   i.src = 'data:image/png;base64,' + this.state.b64;
  // }

  formValidation() {
    if (
      !(this.state.nSamples && this.state.textures.length && this.state.imgSrc)
    ) {
      throw new Error(
        'Enter all required parameters: input image, number of samples and textures'
      );
    } else if (parseFloat(this.state.alpha) < 0) {
      throw new Error('Below minimum alpha (0.0)');
    } else if (parseFloat(this.state.alpha) > 2) {
      throw new Error('Above maximum alpha (2.0)');
    }
  }

  async sendData() {
    this.log('Sending data to TF serving endpoint');

    await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            input_real_img_bytes: { b64: this.state.b64 },
            input_n_style: this.state.nSamples,
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
      .then(response => this.loadData(response, vars))
      .then(
        this.setState({
          progress: 60,
        })
      );
    // .catch(err => alert(err));
  }

  async generate() {
    this.log('Generating images');
    if (this.state.keepHistory) {
      this.setState({
        loading: true,
        status: '',
      });
    } else {
      this.setState({
        genDict: {},
        loading: true,
        myList: [],
        currentImgSrc: '',
        currentImgName: null,
        status: '',
      });
    }

    this.resizeAndSend();
  }

  onImageClick(e) {
    if (e.target.src === this.state.lastClicked) {
      this.setState({
        currentImgSrc: null,
        currentImgName: null,
        lastClicked: '',
      });
    } else {
      const alpha = this.state.alpha;
      const myList = this.state.myList;
      const position = myList.map(tuple => tuple[0]).indexOf(e.target.src);

      // logic so that list images that are not part of current grid can be clicked
      this.setState({
        currentImgSrc: e.target.src || nullImg,
        currentImgName: e.target.src
          ? position < 0
            ? alpha + document.getElementById(e.target.src).parentNode.id
            : myList[position][1]
          : null,
        lastClicked: e.target.src,
      });
    }
  }

  onImageError(e) {
    e.target.src = nullImg;
    alert('Invalid input; please enter a valid image URL or file');
  }

  addToList() {
    const myList = this.state.myList;
    const currentImgSrc = this.state.currentImgSrc;
    const currentImgName = this.state.currentImgName;
    const position = myList.map(tuple => tuple[0]).indexOf(currentImgSrc);

    if (!currentImgSrc || currentImgSrc === nullImg) {
      alert('No image selected');
      return;
    }

    if (position < 0) {
      myList.push([currentImgSrc, currentImgName]);
      this.setState({
        myList: myList,
      });
    } else {
      alert('Image already added');
    }
  }

  removeFromList() {
    const myList = this.state.myList;
    const currentImgSrc = this.state.currentImgSrc;
    const position = myList.map(tuple => tuple[0]).indexOf(currentImgSrc);

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

  saveList() {
    const myList = this.state.myList.map((url, i, arr) => {
      return {
        download: url[0],
        filename: url[1],
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

        if (count === myList.length) {
          zip.generateAsync({ type: 'blob' }).then(function(content) {
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
    } else {
      // note != is intentional here. e.target.value is a string and parseInt(e.target.value) is a number
      if (e.target.value != parseInt(e.target.value)) {
        alert('Please input a whole number');
        e.target.value = parseInt(e.target.value);
      }

      this.setState({
        nSamples: parseInt(e.target.value),
      });
    }
  }

  async setAlpha(value) {
    const alpha = value;
    if (!alpha) {
      this.setState({
        alpha: 0.0,
      });
    } else if (alpha > 200 || alpha < 0) {
      alert('Alpha entered out of bounds (0.0 - 2.0). Please reenter.');
      value = this.state.alpha;
    } else {
      const newAlpha = parseFloat(value / 100);

      this.setState({
        alpha: newAlpha,
      });
    }
  }

  async generateShowDict(newAlpha) {
    function loadImage(url) {
      return new Promise((fulfill, reject) => {
        let imageObj = new Image();
        imageObj.onload = () => fulfill(imageObj);
        imageObj.src = url;
      });
    }

    const genDict = this.state.genDict;
    var showDict = {};

    if (genDict.length === 0) {
      showDict = {};
      return {};
    } else if (Object.keys(genDict).length === 1) {
      showDict = genDict[0];
      return genDict[0];
    } else if (newAlpha in genDict) {
      showDict = genDict[newAlpha];
      return genDict[newAlpha];
    } else if (newAlpha < 1) {
      if (!(0 in genDict && 1 in genDict)) {
        return {};
      }
      const blend1 = genDict[0.0];
      const blend2 = genDict[1.0];

      //sanity check
      if (Object.keys(blend1).length !== Object.keys(blend2).length) {
        throw new Error(
          'Sanity check fail: genDict values for vars not of equal length'
        );
      }

      const list2 = Object.keys(blend1).map(function(texture) {
        const list = blend1[texture].map((img1, index) => {
          var canvas = document.createElement('CANVAS');
          canvas.width = img1.width;
          canvas.height = img1.height;
          var ctx = canvas.getContext('2d');

          return Promise.all([
            loadImage(img1),
            loadImage(blend2[texture][index]),
          ]).then(images => {
            ctx.globalAlpha = 1 - newAlpha;
            canvas.width = images[1].width;
            canvas.height = images[1].height;
            ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = newAlpha;
            ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
            var data = canvas.toDataURL();
            return data;
          });
        });
        return Promise.all(list).then(function(list) {
          showDict[texture] = list;
        });
      });
      return Promise.all(list2).then(function(list) {
        return showDict;
      });
    } else {
      if (!(1 in genDict && 2 in genDict)) {
        return {};
      }
      const blend1 = genDict[1.0];
      const blend2 = genDict[2.0];

      //sanity check
      if (Object.keys(blend1).length !== Object.keys(blend2).length) {
        throw new Error(
          'Sanity check fail: genDict values for vars not of equal length'
        );
      }

      const list2 = Object.keys(blend1).map(function(texture) {
        const list = blend1[texture].map((img1, index) => {
          var canvas = document.createElement('CANVAS');
          canvas.width = img1.width;
          canvas.height = img1.height;
          var ctx = canvas.getContext('2d');

          return Promise.all([
            loadImage(img1),
            loadImage(blend2[texture][index]),
          ]).then(images => {
            ctx.globalAlpha = 2 - newAlpha;
            canvas.width = images[1].width;
            canvas.height = images[1].height;
            ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = newAlpha - 1;
            ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
            var data = canvas.toDataURL();
            return data;
          });
        });
        return Promise.all(list).then(function(list) {
          showDict[texture] = list;
        });
      });
      return Promise.all(list2).then(function(list) {
        return showDict;
      });
    }
  }
  inputChange(e) {
    if (e.target.value) {
      if (this.state.mode === fileInputs.properties[fileInputs.URL].name) {
        this.setState({
          inputSrc: e.target.value,
        });
      } else if (
        this.state.mode === fileInputs.properties[fileInputs.image].name
      ) {
        this.setState({
          inputSrc: URL.createObjectURL(e.target.files[0]),
        });
      } else {
        throw new Error('Misconfigured state');
      }
    } else {
    }
  }

  filter(e) {
    var visible = this.state.visible;
    var position = this.state.visible.indexOf(e.target.value);

    if (position >= 0) {
      visible.splice(position, 1);
    } else {
      visible.push(e.target.value);
    }

    this.setState({
      visible: visible,
    });
  }

  renderFilter() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Header
          as="h5"
          fluid="true"
          style={{ margin: '0px', padding: '0px', marginRight: '5px' }}
        >
          Show/Hide{' '}
        </Header>
        {Object.keys(this.state.showDict)
          .sort()
          .map(texture => (
            <Button
              className="unfocus"
              value={texture}
              onClick={this.filter}
              style={{ padding: '5px' }}
              positive={this.state.visible.indexOf(texture) >= 0}
            >
              {' '}
              {texture}{' '}
            </Button>
          ))}
      </div>
    );
  }

  renderControls() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            flex: '0 0 auto',
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'stretch',
          }}
        >
          <Button.Group
            size="small"
            style={{ margin: '10px 5px', maxHeight: '50px', flex: 0 }}
          >
            <Button
              onClick={() => {
                this.setState({
                  mode: fileInputs.properties[fileInputs.URL].name,
                });
              }}
              active={
                this.state.mode === fileInputs.properties[fileInputs.URL].name
              }
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
              active={
                this.state.mode === fileInputs.properties[fileInputs.image].name
              }
            >
              <Icon name="upload" />
              Disk
            </Button>
          </Button.Group>
          <div style={{ height: 250, width: 250, padding: 10 }}>
            <img
              onError={this.onImageError}
              style={stretchStyle}
              src={this.state.imgSrc || nullImg}
              alt="load fail"
            />
          </div>
          <Button
            type="submit"
            primary
            style={{ margin: '5px', maxHeight: '50px', flex: 1 }}
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
            onSubmit={this.onLoadImage}
          >
            <Form.Input
              action={
                <Button
                  color="blue"
                  labelPosition="left"
                  icon="image"
                  content="Load Image"
                  disabled={this.state.loading}
                />
              }
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
              disabled={!this.state.mode || this.state.loading}
              onChange={e => this.inputChange(e)}
              accept={
                this.state.mode === fileInputs.properties[2].name
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
                width: '145px',
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
                defaultValue="5"
                onChange={e => this.setNSamples(e)}
                disabled={this.state.loading}
              />
              <Checkbox
                label="Keep history"
                style={{ marginBottom: '10px' }}
                onChange={this.toggleHistory}
                disabled={this.state.loading}
              />
              <Checkbox label="Sort by color" disabled />
            </div>
            <div style={controlColumnStyle}>
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
            </div>
            <div style={{ ...controlColumnStyle, marginBottom: '20px' }}>
              {/* <Header as="h4"> Style Transfer</Header>
              <Select
                options={styleOptions}
                defaultValue={0}
                onChange={(e, { value }) =>
                  this.setState({
                    styleTransfer: value,
                    alpha: value ? 1.0 : 0,
                  })
                }
                disabled={this.state.loading}
                style={{ display: 'flex', flex: '1' }}
              /> */}
              <Header as="h4"> Game Style: {this.state.alpha} </Header>
              <Slider
                defaultValue={0}
                disabled={this.state.loading}
                step={5}
                min={0}
                max={200}
                onChange={this.setAlpha}
                marks={sliderMarks}
                style={{ display: 'flex', flex: '0 1 0' }}
              />
              {/* weird bug with rc-slider if step = 0.05 and max = 1.95 */}
            </div>
            <div style={controlColumnStyle}>
              <Header as="h4">Post Processing</Header>
              <div style={{ marginLeft: '10px' }}>
                <Checkbox
                  label="Apply alpha channel"
                  style={{ marginBottom: '10px' }}
                  disabled
                />
                <Checkbox
                  label="Resize generated sample"
                  onChange={e => {
                    this.toggleResizeSelect(e);
                  }}
                  disabled
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
            <Header as="h5">Progress Status: {this.state.status} </Header>
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
    return this.state.myList.map(urlName => (
      <div
        style={{
          width: size,
          height: size,
          padding: 5,
          border: this.state.lastClicked === urlName[0] ? 'solid 1px #ccc' : '',
        }}
        onClick={e => this.onImageClick(e)}
      >
        <img
          style={stretchStyle}
          src={urlName[0]}
          key={urlName[0]}
          alt="load fail"
        />
      </div>
    ));
  }

  renderCategory(list, key, alpha) {
    return list.map((url, index) => (
      <div
        style={{
          display: 'flex',
          flex: '1 1 17%',
          padding: 5,
          maxWidth: '20%',
          border: this.state.lastClicked === url ? 'solid 1px #ccc' : '',
        }}
        onClick={e => this.onImageClick(e)}
        id={key + index}
      >
        <img
          style={stretchStyle}
          src={url}
          key={url}
          id={url}
          alt={'load fail'}
          onClick={e => this.onImageClick(e)}
        />
      </div>
    ));
  }

  renderGridItems() {
    const alpha = this.state.alpha;

    return Object.keys(this.state.showDict)
      .sort()
      .map((key, index) => (
        <div id={key} hidden={this.state.visible.indexOf(key) < 0}>
          <Header as="h4" style={{ textAlign: 'center' }}>
            {key}
          </Header>
          <div
            style={{
              flex: 1,
              ...gridStyle,
              margin: 5,
              padding: 5,
              display: 'flex',
              overflowY: 0,
              borderBottom: 'solid 1px #ccc',
            }}
          >
            {' '}
            {this.renderCategory(this.state.showDict[key], key, alpha)}
          </div>
        </div>
      ));
  }

  renderImages() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '427px',
          maxHeight: 'calc(100vh - 350px)',
          height: '100%',
        }}
      >
        <div
          style={{
            flex: '0 0 auto',
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingBottom: 10,
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: 10, flex: '0 0 auto', height: 250 }}>
            <img
              style={stretchStyle}
              src={this.state.currentImgSrc || nullImg}
              alt="load fail"
            />
          </div>
          <div style={{ display: 'flex' }}>
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
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            margin: '10px',
            paddingBottom: '20px',
            height: '100%',
          }}
        >
          <Segment compact attached="top" style={{ padding: '0.5em 1em' }}>
            {' '}
            {this.renderFilter()}{' '}
          </Segment>
          <Segment
            attached
            style={{
              flex: 1,
              display: 'flex',
              ...gridStyle,
              ...borderStyle,
              flexWrap: 0,
              flexDirection: 'column',
              placeContent: 'start',
              padding: 0,
            }}
          >
            {this.renderGridItems()}
          </Segment>
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
        <div style={{ flex: 1 }}>{this.renderImages()}</div>
      </div>
    );
  }
}

export default App;
