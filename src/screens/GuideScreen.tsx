import * as React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, Modal } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Region, ToiletMarker, ElevatorMarker, GuideLine, GuideLines, Elevators, GuideScreenMapState } from 'src/domains/map';
import { Gate, StartGate, EndGate} from 'src/domains/gate';
import { GuideLineObject, ObjectPoints } from 'src/domains/movie';
import MovieNavigateComponent from '../components/movieComponents/MovieNavigateComponent';
import MapViewComponent from '../components/mapComponents/MapViewComponent';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Modal as ModalCarousel } from '../components/Modal';
import Colors from '../constants/Colors';
import movieIcon from '../../assets/images/movie-load-icon.png';
import { getGuidelines } from '../services/guidelines';

interface Props { navigation: any; }

type Carousel = GuideLineObject | Gate;

interface BaseState {
  showModal: boolean;
  modalVisible: boolean;
}

export interface ActiveMapState extends BaseState{
  indoorLevel: string;
  initializedLocation: Region | undefined;
  movieMarkers: GuideLineObject[] | undefined;
  toilets: ToiletMarker[] | undefined;
  elevators: ElevatorMarker[] | undefined;
  object_points: GuideLineObject[] | undefined;
  movies: GuideLineObject[];
  carouselMarker?: Carousel;
  start_gate: Gate;
  end_gate: Gate;
  guideline: GuideLine;
}

interface ActiveMovieState extends BaseState {
  movieId: string | undefined;
  thumbnails: string[];
  // FIXME 必要なものがわからん
}

type State = ActiveMapState & ActiveMovieState & StartGate & EndGate & GuideScreenMapState & ObjectPoints;

export default class GuideScreen extends React.Component<Props, State> {
  public static navigationOptions = {
    headerStyle: { display: 'none' },
  };

  readonly state: State = {
    showModal: false,
    carouselMarker: undefined,
    modalVisible: false,
  };

  async componentDidMount () {
    const mapData: State = await getGuidelines(6, 11);

    this.setState({
      indoorLevel: '1',
      initializedLocation: {
        latitude: 35.46588771428577,
        longitude: 139.62227088041905,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      movieMarkers: this.indoorChanges(mapData.object_points),
      guideLines: this.indoorChanges(mapData.guideline),
      elevators: this.indoorChanges(mapData.elevators),
      toilets: this.indoorChanges(mapData.toilets),
      objectPoints: this.indoorChanges(mapData.object_points),
      startGate: this.indoorChange(mapData.start_gate),
      endGate: this.indoorChange(mapData.end_gate),
      movieId: undefined,
      thumbnails: ['OwSekWSe7NM', 'OwSekWSe7NM', 'OwSekWSe7NM', 'OwSekWSe7NM', 'OwSekWSe7NM'],
    });
  }

  public render () {
    // NITS もう少し厳密に判断した方がいい説 :thinking:
    if (this.state.indoorLevel === undefined && this.state.movieId === undefined) {
      return null;
    }

    const {
      indoorLevel, initializedLocation, startGate, endGate,
      toilets, guideLines, objectPoints,
    } = this.state;

    const carousel = [startGate, ...objectPoints, endGate];
    const currentCarousel = carousel.filter(objectPoint => objectPoint.floor === this.state.indoorLevel);

    return (
      <View style={styles.content_wrap}>
        <MapViewComponent
          indoorLevel={indoorLevel}
          initializedLocation={initializedLocation!}
          movieMarkers={this.createMovieMarkers()}
          toiletMarkers={toilets}
          //elevatorMarkers={elevators}
          guideLines={guideLines}
          changeIndoorLevel={this.changeIndoorLevel}
          carouselMarker={this.state.carouselMarker}
          changeCarousel={this.changeCarousel.bind(this)}
          startGate={this.gateChange(this.state.startGate)}
          endGate={this.gateChange(this.state.endGate)}
        />
        {/* TODO
          MapComponentは常に表示して、ビデオを出し分けるなどしたい
        */}
        <ModalCarousel modalView={this.state.showModal}>
          <Carousel
            data={currentCarousel}
            itemWidth={Dimensions.get('screen').width * 0.8}
            sliderWidth={Dimensions.get('screen').width}
            sliderHeight={Dimensions.get('screen').height}
            renderItem={this.carouselRenderItem}
            lockScrollWhileSnapping={true}
            onSnapToItem={this.carouselOnSnapToItem}
            inactiveSlideShift={0.1}
            firstItem={this.carouselFirstItem(currentCarousel)}
          />
          <Pagination
            activeDotIndex={this.carouselFirstItem(currentCarousel) ? this.currentPaginationPoint(currentCarousel) : 1}
            dotsLength={currentCarousel.length > 6 ? 6 : currentCarousel.length}
            dotStyle={styles.paginationDotStyle}
          />
        </ModalCarousel>
        <Modal
          animationType='slide'
          presentationStyle='fullScreen'
          transparent={false}
          visible={this.state.modalVisible}
        >
          <MovieNavigateComponent setMovieModalVisible={this.closeMovieModal} />
        </Modal>
        { currentCarousel.length !== 0 ?
          <View style={styles.showModalBottomAround}>
            <TouchableOpacity onPress={this.changeModal.bind(this, initializedLocation)} style={styles.showModalBottom} >
              {
                this.state.showModal ?
                  <View style={styles.closeModalBottomText}>
                    <Text style={styles.closeText}>
                      CLOSE
                    </Text>
                  </View> :
                  <View style={styles.openModalBottomText}>
                    <Text style={styles.openText}>
                      OPEN
                    </Text>
                  </View>
              }
            </TouchableOpacity>
          </View> : null
        }
      </View>
    );
  }

  private setMovieModalVisible = (modalVisible: boolean) => this.setState({ modalVisible });

  private openMovieModal = () => this.setMovieModalVisible(true);

  private closeMovieModal = () => this.setMovieModalVisible(false);

  private gateChange = (gateMarker: Gate) => {
    if (this.state.carouselMarker !== gateMarker) return gateMarker;
    return;
  }

  private indoorChanges = (items: any) => {
    if (items == undefined) return;

    return items.map((item: Gate) => {
      const floor = String(item.floor).replace('-', 'B');
      item.floor = floor;
      return item;
    });
  }

  private indoorChange = (items: Gate) => {
    const floor = String(items.floor).replace('-', 'B');
    items.floor = floor;
    return items;
  }

  private currentPaginationPoint = (currentCarousel: Carousel[]) => {
    const currentPoint = this.carouselFirstItem(currentCarousel);

    if (currentPoint == undefined) return undefined;
    if (currentPoint > 6 ) return  Math.round((6 / currentPoint) * 6);
    return currentPoint;
  }

  private carouselRenderItem = ({item})=> {
    const carousel = [this.state.startGate, ...this.state.objectPoints, this.state.endGate];
    const type = this.state.carouselMarker ? this.state.carouselMarker.type || null :null;

    return (
      <View style={styles.carousel}>
        <View style={styles.carouselInText}>
          <Text style={styles.carouselText}>{carousel.indexOf(item) + 1}</Text>
        </View>
        {
          carousel.indexOf(item) !== 0 && carousel.indexOf(item) !== carousel.length - 1 && type === 'movie' ?
          <View style={styles.carouselMovieBottom}>
            <TouchableOpacity style={styles.carouselMovieBottomRadius} onPress={this.openMovieModal}>
              <Image source={movieIcon} style={styles.movieIcon} />
            </TouchableOpacity>
          </View> : null
        }
      </View>
    );
  }

  private carouselOnSnapToItem = (index: number) => {
    if (this.state.objectPoints == undefined) return;

    const carousel = [this.state.startGate, ...this.state.objectPoints, this.state.endGate];
    const currentCarousel = carousel.filter(objectPoint => objectPoint.floor === this.state.indoorLevel);
    return this.changeInitializedLocation(currentCarousel[index]);
  }

  private changeModal = (initializedLocation: Region) => {
    const centerLatitude = 0.0006;
    this.state.showModal ?
    this.setState({
      showModal: false,
      initializedLocation: {
        latitude: initializedLocation.latitude + centerLatitude,
        longitude: initializedLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
    }) : this.setState({
      showModal: true,
    });
  }

  private changeIndoorLevel = (nextIndoorLevel: string) => {
    const validatedIndoorLevel = nextIndoorLevel.replace(/階/, '');
    const indoorLevel = validatedIndoorLevel.substr(-2);
    this.setState({ indoorLevel });
  }

  private changeInitializedLocation = (carousel: Carousel) => {
    const centerLatitude = -0.0006;
    const latitude = carousel.latitude + centerLatitude;
    this.setState({
      initializedLocation: {
        latitude: latitude,
        longitude: carousel.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      carouselMarker: carousel,
    });
  }

  private createMovieMarkers = () => {
    if (this.state.movieMarkers == undefined) return;
    if (this.state.carouselMarker == undefined) return this.state.movieMarkers;
    if (this.state.carouselMarker === this.state.startGate || this.state.carouselMarker === this.state.endGate) return this.state.movieMarkers;

    const carouselMarkerId = this.state.carouselMarker.id;
    return this.state.movieMarkers.filter(movieMarker => movieMarker.id !== carouselMarkerId);
  }

  private changeCarousel = (carouselMarker: Carousel) => {
    const centerLatitude = -0.0006;
    const latitude = carouselMarker.latitude + centerLatitude;
    this.setState({
      showModal: true,
      carouselMarker: carouselMarker,
      initializedLocation: {
        latitude: latitude,
        longitude: carouselMarker.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
    });
  }

  private carouselFirstItem = (currentCarousel: Carousel[]) => {
    const carouselMarker = this.state.carouselMarker;
    if(carouselMarker == undefined) return;

    return currentCarousel.indexOf(carouselMarker);
  }
}

EStyleSheet.build();
const {width, height} = Dimensions.get('screen');

const styles = EStyleSheet.create({
  content_wrap: {
    flex: 1,
    top: 0,
    position: 'relative',
    //marginBottom: height * 0.07,
  },
  thumbnails: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 90,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
  },
  thumbnailImage: {
    width: 120,
    height: 90,
  },
  modal: {
    width: width * 0.79,
    height: height * 0.48,
    backgroundColor: 'red',
    marginBottom: height * 0.05,
  },
  modalInView: {
    width: width * 0.79,
    height: height * 0.48,
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  showModalBottom: {
    width: width * 0.42,
    height: height * 0.05,
    justifyContent: 'center',
    position: 'absolute',
  },
  openModalBottomText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.subColorRed,
    width: width * 0.44,
    height: height * 0.08,
    borderRadius: '0.3rem',
    paddingBottom: '0.3rem',
  },
  openText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: '0.05rem',
  },
  closeText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: '0.05rem',
  },
  closeModalBottomText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    width: width * 0.44,
    height: height * 0.08,
    borderRadius: '0.3rem',
    paddingBottom: '0.3rem',
  },
  showModalBottomAround: {
    width: width,
    height: height * 0.08,
    position: 'absolute',
    bottom: '-1rem',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  carousel: {
    width: width * 0.79,
    height: height * 0.33,
    backgroundColor: '#eee',
    position: 'absolute',
    justifyContent: 'center',
    bottom: 0,
  },
  view: {
    width: width,
    height: '50%',
    backgroundColor: 'rgba(50, 50, 50, 1)',
  },
  paginationDotStyle: {
    backgroundColor: '#fff',
    marginBottom: height * 0.03,
    marginTop: height * -0.025,
    zIndex: 5,
  },
  carouselInText: {
    position: 'absolute',
    width: width * 0.12,
    height: width * 0.12,
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(77, 178, 124, 0.8)',
  },
  carouselText: {
    color: Colors.white,
    fontSize: '2rem',
    fontWeight: '700',
  },
  carouselMovieBottom: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 50,
    zIndex: 100,
  },
  carouselMovieBottomRadius: {
    borderRadius: 50,
    width: width * 0.16,
    height: width * 0.16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselMovieBottomText: {
    color: Colors.white,
    fontWeight: '700',
  },
  movieIcon: {
    width: width * 0.085,
    height: width * 0.085,
  },
});
