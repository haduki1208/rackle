import * as React from "react";
import {  Marker } from "react-native-maps";

interface MarkerComponentProps {
    key: number;
    latLng: {
        latitude: number;
        longitude: number;
    };
    iconName: string;
    pinColor: string;
}

interface MarkerComponentState {
    latLng: {
        latitude: number,
        longitude: number,
    };
    iconName: string;
    pinColor: string;
}

export default class MarkerComponent extends React.Component <MarkerComponentProps, MarkerComponentState> {
    constructor(props: MarkerComponentProps) {
        super (props);
        this.state =  {
            latLng: this.props.latLng,
            iconName: this.props.iconName,
            pinColor: this.props.pinColor,
        };
    }

    // propsの更新。これをしないとマーカーが更新されない
    public componentWillReceiveProps(nextProps: MarkerComponentProps) {
        this.setState ({
            latLng: nextProps.latLng,
            iconName: nextProps.iconName,
        });
    }

    public render() {
       return (
            <Marker
                coordinate={this.state.latLng}
                tracksInfoWindowChanges={false}
                pinColor={this.state.pinColor}
                image={this.iconChange ()}
                // opacity={0.8}

            />
        );
    }

    // 必要な画像をしてい
    private iconChange() {
        if (this.state.iconName === "toilet") return require("../../../assets/images/toilet.jpg");
        // if (this.state.iconName === "floor") return require("../../../assets/images/floor.jpg");
        if (this.state.iconName === "destination") return false;
    }
}
