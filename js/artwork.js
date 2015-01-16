//window events
window.onresize = updateModalSize(); //resizes the modal if the screen height changes
$(window).on("orientationchange", updateModalSize()); //need to test on a mobile device

//global configs
var randomizeCollection = 1; //controlled by randomizeConfig() with a default of random
var artAddBatchSize = 12; //count of pieces to be added per instance of addArtToGalleryFunction

//global vars
var collectionLength; //the length of the entire collection object
var currentCollection; //a snapshot of the filtered collection object
var currentLength; //the length of the filtered collection object
var countArtAdds; //count of how many times the addArtToGalleryFunction has run
var artDisplayed; //count of pieces displayed in gallery
var artRemaining; //count of pieces not displayed in gallery
var nextArtAddIndex; //index of the next piece to be loaded into the gallery
var currentArtImgIndex; //index of modal piece in collection object

//crossfilter object
var artCollectionCrossFilter;

//crossfilter filters (currently 15; max of 32)
var artTitleFilter;
var artMediumFilter;
var artStatusFilter;
var tagAbstractFilter;
var tagBlackAndWhiteFilter;
var tagDominicanRepublicFilter;
var tagFigureFilter;
var tagLandscapeFilter;
var tagLetterFilter;
var tagMonheganFilter;
var tagPathFilter;
var tagRepresentationalFilter;
var tagSeascapeFilter;
var tagStillLifeFilter;
var tagTondoFilter;

//crossfilter accessors
var artTitleAccessor = function(d) {
  return d.title;
};
var artMediumAccessor = function(d) {
  return d.filterMedium;
};
var artStatusAccessor = function(d) {
  return d.filterStatus;
};
var abstractAccessor = function(d) {
  return d.tagAbstract;
};
var blackAndWhiteAccessor = function(d) {
  return d.tagBlackAndWhite;
};
var dominicanRepublicAccessor = function(d) {
  return d.tagDominicanRepublic;
};
var figureAccessor = function(d) {
  return d.tagFigure;
};
var landscapeAccessor = function(d) {
  return d.tagLandscape;
};
var letterAccessor = function(d) {
  return d.tagLetter;
};
var monheganAccessor = function(d) {
  return d.tagMonhegan;
};
var pathAccessor = function(d) {
  return d.tagPath;
};
var representationalAccessor = function(d) {
  return d.tagRepresentational;
};
var seascapeAccessor = function(d) {
  return d.tagSeascape;
};
var stillLifeAccessor = function(d) {
  return d.tagStillLife;
};
var tondoAccessor = function(d) {
  return d.tagTondo;
};


//load collection object, set global & crossfilter vars and add first 8 pieces to gallary
d3.csv('/data/artCollection.csv', function(data) {
  //update crossfilter vars
  artCollectionCrossFilter = crossfilter(data);
  artTitleFilter = artCollectionCrossFilter.dimension(artTitleAccessor);
  artMediumFilter = artCollectionCrossFilter.dimension(artMediumAccessor);
  artStatusFilter = artCollectionCrossFilter.dimension(artStatusAccessor);
  tagAbstractFilter = artCollectionCrossFilter.dimension(abstractAccessor);
  tagBlackAndWhiteFilter = artCollectionCrossFilter.dimension(blackAndWhiteAccessor);
  tagDominicanRepublicFilter = artCollectionCrossFilter.dimension(dominicanRepublicAccessor);
  tagFigureFilter = artCollectionCrossFilter.dimension(figureAccessor);
  tagLandscapeFilter = artCollectionCrossFilter.dimension(landscapeAccessor);
  tagLetterFilter = artCollectionCrossFilter.dimension(letterAccessor);
  tagMonheganFilter = artCollectionCrossFilter.dimension(monheganAccessor);
  tagPathFilter = artCollectionCrossFilter.dimension(pathAccessor);
  tagRepresentationalFilter = artCollectionCrossFilter.dimension(representationalAccessor);
  tagSeascapeFilter = artCollectionCrossFilter.dimension(seascapeAccessor);
  tagStillLifeFilter = artCollectionCrossFilter.dimension(stillLifeAccessor);
  tagTondoFilter = artCollectionCrossFilter.dimension(tondoAccessor);
  //setup gallery
  resetAllFilters()
  showNote();
});


//collection functions
function snapshotCollection () {
  collectionLength = artCollectionCrossFilter.size();
  currentLength = artMediumFilter.top(Infinity).length;
  if (randomizeCollection === 1) {
    currentCollection = artMediumFilter.top(Infinity);
    currentCollection = randomizeArray(currentCollection);
  } else {
    currentCollection = artMediumFilter.top(Infinity);
  }
}


//filter functions
function filterArtTitle () {
  var searchTitle = document.getElementById('title-search-text').value;
  //clear title crossfilter
  artTitleFilter.filterAll();  
  //remove all images from gallery
  removeArtFromGallery();
  //apply crossfilter
  artTitleFilter.filterFunction(function(d) {
    pieceBeingSearched = d.toLowerCase();
    searchTitle = searchTitle.toLowerCase();
    if(pieceBeingSearched.search(searchTitle) > -1){
      return pieceBeingSearched;
    }
  });
  //reset gallery
  resetGallery();
}

$(document).keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    var searchTitle = document.getElementById('title-search-text').value;
    if(keycode == '13'){
      if(searchTitle.length >= 1) {
        filterArtTitle();
      }
    }
});

function filterArtMedium (selectedMedium) {
  //clear medium crossfilter
  artMediumFilter.filterAll();   
  //update dropdown button text
  d3.select('#medium-btn').text(selectedMedium + " ");
  d3.select('#medium-btn').append('span')
    .attr('class', 'caret');
  //make button grey
  d3.select('#medium-btn')
    .attr('class', 'btn btn-default btn-sm dropdown-toggle btn-filtered');
  //remove all images from gallery
  removeArtFromGallery();
  //apply crossfilter
  artMediumFilter.filter(selectedMedium); 
  //reset gallery
  resetGallery();
}

function filterArtAvailability (selectedAvailability) {
  //clear crossfilters
  artStatusFilter.filterAll();  
  //update dropdown button text
  d3.select('#availability-btn').text(selectedAvailability + " ");
  d3.select('#availability-btn').append('span')
    .attr('class', 'caret');
  //make button grey
  d3.select('#availability-btn')
    .attr('class', 'btn btn-default btn-sm dropdown-toggle btn-filtered');
  //remove all images from gallery
  removeArtFromGallery();
  //apply crossfilter
  artStatusFilter.filter(selectedAvailability);
  //reset gallery
  resetGallery();
}

function filterArtTag (selectedTag) {
  //clear crossfilters
  resetAllTagFilters();
  //update dropdown button text
  d3.select('#tag-btn').text(selectedTag + " ");
  d3.select('#tag-btn').append('span')
    .attr('class', 'caret');
  //make button grey
  d3.select('#tag-btn')
    .attr('class', 'btn btn-default btn-sm dropdown-toggle btn-filtered');
  //remove all images from gallery
  removeArtFromGallery();
  //apply crossfilter
  switch(selectedTag) {
    case 'Abstract':
        tagAbstractFilter.filter('x');
        break;
    case 'Black and White':
        tagBlackAndWhiteFilter.filter('x');
        break;
    case 'Dominican Republic':
        tagDominicanRepublicFilter.filter('x');
        break;
    case 'Figure':
        tagFigureFilter.filter('x');
        break;
    case 'Landscape':
        tagLandscapeFilter.filter('x');
        break;
    case 'Letter':
        tagLetterFilter.filter('x');
        break;
    case 'Monhegan':
        tagMonheganFilter.filter('x');
        break;
    case 'Path':
        tagPathFilter.filter('x');
        break;
    case 'Representational':
        tagRepresentationalFilter.filter('x');
        break;
    case 'Seascape':
        tagSeascapeFilter.filter('x');
        break;
    case 'Still Life':
        tagStillLifeFilter.filter('x');
        break;
    case 'Tondo':
        tagTondoFilter.filter('x');
        break;
  } 
  //reset gallery
  resetGallery();
}

function resetAllTagFilters () {
  tagAbstractFilter.filterAll();
  tagBlackAndWhiteFilter.filterAll();
  tagDominicanRepublicFilter.filterAll();
  tagFigureFilter.filterAll();
  tagLandscapeFilter.filterAll();
  tagLetterFilter.filterAll();
  tagMonheganFilter.filterAll();
  tagPathFilter.filterAll();
  tagRepresentationalFilter.filterAll();
  tagSeascapeFilter.filterAll();
  tagStillLifeFilter.filterAll();
  tagTondoFilter.filterAll();
}

function resetAllFilters() {
  //clear all crossfilters
  artTitleFilter.filterAll();
  artMediumFilter.filterAll();
  artStatusFilter.filterAll();    
  resetAllTagFilters();
  //vars for button resets
  var buttons = ['#medium-btn', '#tag-btn', '#availability-btn'];
  var buttonsText = ['Medium ', 'Tag ', 'Availability '];
  //reset dropdown text
  for (var i = buttons.length - 1; i >= 0; i--) {
  d3.select(buttons[i]).text(buttonsText[i]);
  d3.select(buttons[i]).append('span')
    .attr('class', 'caret');
  }
  //reset button color
  for (var i = buttons.length - 1; i >= 0; i--) {
    d3.select(buttons[i])
      .attr('class', 'btn btn-default btn-sm dropdown-toggle');
  }
  //remove all images from gallery
  removeArtFromGallery();
  //restore Load More button
  d3.select('#more-art-btn').style('display','block');
  //reset gallery
  resetGallery();
}


//gallery functions
function addArtToGallery () {
  var artAdded = 0;
  if (artRemaining <= artAddBatchSize) {
    for (var i= artRemaining; i > 0; i--) {
      var path = currentCollection[nextArtAddIndex].directory + currentCollection[nextArtAddIndex].file;
      d3.select('#art-gallery-ul')
        .append('li')
        .attr('id', 'li'+nextArtAddIndex)
        .attr('class', 'col-lg-3 col-md-3 col-sm-4 col-xs-6');
      d3.select('#li'+nextArtAddIndex)
        .append('img')
        .attr('id', nextArtAddIndex)
        .attr('class', 'img-thumbnail thumbnail-height')
        .attr('src', path)
        .attr('title', currentCollection[nextArtAddIndex].title)
        .attr('onclick', 'showArtModal(this.id)');
      nextArtAddIndex++;
      artAdded++;
    }
  } else {
    for (var i = 0; i < artAddBatchSize ; i++) {
      var path = currentCollection[nextArtAddIndex].directory + currentCollection[nextArtAddIndex].file;
      d3.select('#art-gallery-ul')
        .append('li')
        .attr('id', 'li'+nextArtAddIndex)
        .attr('class', 'col-lg-3 col-md-3 col-sm-4 col-xs-6');
      d3.select('#li'+nextArtAddIndex)
        .append('img')
        .attr('id', nextArtAddIndex)
        .attr('class', 'img-thumbnail thumbnail-height')
        .attr('src', path)
        .attr('title', currentCollection[nextArtAddIndex].title)
        .attr('onclick', 'showArtModal(this.id)');
      nextArtAddIndex++;
      artAdded++;
    }
  }
  //update gallery statistics
  countArtAdds++;
  artDisplayed = artDisplayed + artAdded;
  artRemaining = currentLength - artDisplayed;
  logGalleryStats(artAdded);
  //update art counter
  if (currentLength === collectionLength) {
    d3.select('#art-btn-counter-top').text(artDisplayed + " of " + currentLength 
      + " pieces displayed");
    d3.select('#art-btn-counter-bottom').text('');
  } else {
    if (artDisplayed === 0) {
      d3.select('#art-btn-counter-top').text("No pieces match the selected criteria.");
      d3.select('#art-btn-counter-bottom').text('(' + collectionLength + " pieces in the collection)");
    } else {
      d3.select('#art-btn-counter-top').text("Displaying " + artDisplayed + " pieces");
      d3.select('#art-btn-counter-bottom').text("(" + currentLength + " of " + 
        collectionLength + " pieces match the selected criteria)");
    }
  }
  //remove Load More button if artRemaining is 0
  if(artRemaining === 0){
      d3.select('#more-art-btn').style('display','none');
    } 
}

function removeArtFromGallery () {
  d3.select('#art-gallery-ul')
    .selectAll('li')
    .remove();
}

function resetGallery () {
  snapshotCollection();
  artDisplayed = 0;
  artRemaining = currentLength;
  nextArtAddIndex = 0;
  addArtToGallery();
}

function logGalleryStats (artAdded) {
  console.log("###### Art Load #" + countArtAdds + " Stats ######");
  console.log("Pieces in collection object: " + collectionLength);
  console.log("Pieces matching current filter :" + currentLength);
  console.log("Pieces currently being displayed:  " + artDisplayed);
  console.log("Pieces added to display in this load: " + artAdded);
  console.log("Pieces left to add to display: " + artRemaining);
}


//modal functions
function showArtModal (elementID) {
  //update global vars
  currentArtImgIndex = Number(elementID);
  //update and resize modal
  updateModalHTML(elementID);
  updateModalSize();
  //show modal
  $('#artModal').modal();
}

function updateModalHTML (elementID) {
  //html vars
  var artYear = currentCollection[elementID].year;
  var artTitle 
    if (artYear != "") {
      artTitle = currentCollection[elementID].title + " (" + artYear + ")";
    } else {
      artTitle = currentCollection[elementID].title;
    }     
  var artPath = currentCollection[elementID].directory + currentCollection[elementID].file;     
  var artMedium = currentCollection[elementID].medium;
  var artDimensions = currentCollection[elementID].dimensions;
  var artStatus = currentCollection[elementID].filterStatus;
  //update modal html
  d3.select('.modal-header h4').text(artTitle);
  d3.select('#modal-img').remove();
  d3.select('#art-img-container')
    .append('img')
    .attr('id', 'modal-img')
    .attr('class', 'img-responsive')
    .attr('src', artPath);
  d3.select('#modal-footer-top').text(artMedium + ', ' + artDimensions);
  if (artStatus === "Available") {
    var emailTitleMediumDimensions = artTitle + ' (' + artMedium + ', ' + artDimensions + ')';
    var emailContacts;
    if (currentCollection[elementID].contact === 'kornbluthart@gmail.com') {
      emailContacts = currentCollection[elementID].contact;
    } else {
      emailContacts = currentCollection[elementID].contact + '?cc=' + 'kornbluthart@gmail.com';
    }
    d3.select('#modal-footer-bottom').text('Available: ');
    d3.select('#modal-footer-bottom')
      .append('a')
      .attr('href', 'mailto:' + emailContacts + '&Subject=' + 'Inquiry: ' + emailTitleMediumDimensions + 
        '&body=' + 'I am interested in ' + emailTitleMediumDimensions + 
        ', which I found on franceskornbluth.com; please send more information.')
      .attr('title', 'Click to email: ' + currentCollection[elementID].contact)
      .text(currentCollection[elementID].seller);
  } else {
    d3.select('#modal-footer-bottom').text("Collection " + currentCollection[elementID].ownership);
  }
}

function updateModalSize () {
  var currentScreenHeight = $( window ).height();
  var modalContentMaxHeight = currentScreenHeight * .82;
  var modalImgMaxHeight = currentScreenHeight * .5;
  $('.modal-content').css('max-height', modalContentMaxHeight);
  $('#modal-img').css('max-height', modalImgMaxHeight);
}

function prevArt () {
  //update global vars
  if (currentArtImgIndex === 0) {
    currentArtImgIndex = artDisplayed-1;
  } else {
    currentArtImgIndex = currentArtImgIndex-1;
  }
  //update and resize modal
  updateModalHTML(currentArtImgIndex);
  updateModalSize();
}

function nextArt () {
  //update global vars
  if (currentArtImgIndex === artDisplayed-1) {
    currentArtImgIndex = 0;
  } else {
    currentArtImgIndex = currentArtImgIndex+1;
  }
  //update and resize modal
  updateModalHTML(currentArtImgIndex);
  updateModalSize();
}


//helper functions
function showNote () {
  d3.selectAll("#note")
    .transition()
    .duration(1600)
    .style("color", "rgb(162,162,162)");
  setInterval(function () {hideNote();}, 1200);
}

function hideNote () {
  d3.selectAll("#note")
    .transition()
    .duration(1900)
    .style("color", "rgb(255, 255, 255)");
}

function randomizeConfig () {
  if (randomizeCollection === 0) {
    randomizeCollection = 1;
  } else {
    randomizeCollection = 0;
  }
}

function randomizeArray (array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}


/////////////////////// 
//////// TO DO //////// 
/////////////////////// 
// search
// mobile solution fr filters 
//populate drop-down lists dynamically and add counts
// trigger addArtToGallery if modal nextArt reaches end of loaded images 
      //and more images remain in artRemaining
// Decade dropdown
// collector function