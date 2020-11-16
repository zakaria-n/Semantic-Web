import React from "react";
import mediasUtil from '../utils/medias.util';
import "../style/song.page.css";
import {CircularProgress} from "@material-ui/core";

export default class GroupPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            medias: {
                picture: '',
                topSongs: '',
                biography: '',
                deezer: '',
            },
            group: {},
        }
    }

    fetchData = () => { //Get info
        const group = this.props.group;
        console.log("POST grouppage");
        console.log(group);
        const queryString = "select ?group ?Name ?Comment str(?StartYear) as ?StartYearString GROUP_CONCAT(DISTINCT ?Genre;SEPARATOR=\" | \") as ?Genres GROUP_CONCAT(DISTINCT ?Album;SEPARATOR=\" | \") as ?Albums GROUP_CONCAT(DISTINCT ?Members;SEPARATOR=\" | \") as ?Members GROUP_CONCAT(DISTINCT ?Former_Members;SEPARATOR=\" | \") as ?Former_Members GROUP_CONCAT(DISTINCT ?Link;SEPARATOR=\" | \") as ?HomepageLink where { ?group rdf:type dbo:Group. ?group rdfs:label ?Name. ?group dbo:wikiPageID  ?Id. ?group dbo:activeYearsStartYear ?StartYear. OPTIONAL{ ?group foaf:homepage ?Link. } OPTIONAL{ {?group dbo:bandMember ?Members. ?Members rdf:type dbo:Person.} UNION {?group dbp:pastMembers ?Members.} }. OPTIONAL{ ?group dbo:formerBandMember ?Former_Members. ?Former_Members rdf:type dbo:Person. }. OPTIONAL{ ?group dbo:genre ?Genre. }. OPTIONAL{ ?group rdfs:comment ?Comment. }. OPTIONAL{ ?group ^dbo:artist ?Album. ?Album rdf:type dbo:Album. }. FILTER(regex(str(?Id), \"152438\") && langMatches(lang(?Name),\"EN\") && langMatches(lang(?Comment),\"EN\")). } LIMIT 1";
        const formData = new FormData();
        formData.append('query', queryString)
        fetch("http://dbpedia.org/sparql", {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        }).then(response => response.json())
            
            .then(response => {
                    this.setState({
                        group: response.results.bindings[0],
                    });
                    
                }
            );

        
    }

    fetchMedias = async () => { //Get media info
        if (this.props.group) {
            const medias = await mediasUtil.getGroupMedias(this.props.group.Name.value);
            this.setState(
                {
                    medias:
                        {
                            picture: medias.picture,
                            topSongs: medias.topSongs,
                            biography: medias.biography,
                            deezer: medias.deezer
                        }
                }
            );
        }
    }

    componentDidMount = () => { //Load data
        this.fetchData();
        this.fetchMedias();
    }

    componentDidUpdate = (prevProps) => { //Update data
        if (this.props.group !== prevProps.group) {
            if (this.props.group !== undefined) {
                this.fetchData();
                this.fetchMedias();
            }
        }
    }

    affichageAlbum(group) { //Display list of Album
        if (group.Albums.value === "") return (<div>No Albums</div>);
        let albums = this.state.group.Albums.value.split("|");
        return albums.map((val) => {
            val = val.replace("http://dbpedia.org/resource/", "");
            val = val.replaceAll("_", " ");
            var reg = new RegExp(/\(.*[Aa]lbum.*\)/, "g");
            val = val.replace(reg,"");
            return (<div key={val}>{val}</div>);
        });
    }

    /*affichageMembers(group) { //Display list of members

    }*/

    affichageHomepages(group) { //Display list of homepages
        if (group.HomepageLink.value === "") return (<span>Unknown</span>);
        let homepages = this.state.group.HomepageLink.value.split("|");
        return homepages.map((val) => {
            return (<a key={val} href={val} rel="noreferrer" target="_blank">{val}</a>);
        });
    }

    affichageTopSongs() {
        if (!this.state.medias.topSongs || this.state.medias.topSongs === "") return <br/>;
        return (
            <span>
                <div>
                    <br/>
                    <strong>Consult the group's top songs here : </strong>
                    <a href={this.state.medias.topSongs} rel="noreferrer" target="_blank">top songs</a>
                </div>
                <br/>
            </span>
        );
    }

    affichageDeezer = () => {
        if (!this.state.medias.deezer) return null;
        return (
            <div className="bottombar">
                <iframe title="Deezer artist" scrolling="yes" frameBorder="0"
                        src={`https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=EF5466&layout=&size=medium&type=artist&id=${this.state.medias.deezer}&app_id=1`}
                        width="700" height="100"/>
            </div>
        )
    }
    render = () => {


        /*if(!this.props.group){
            console.log("return vide");
            return(<div></div>);
        }*/
        const group = this.state.group;
        console.log("render() grouppage");
        console.log(group);

        if(!group.Name) {
            group.Name = {};
            group.Name.value = "";
        }

        if(!group.StartYearString) {
            group.StartYearString = {};
            group.StartYearString.value = "";
        }
        
        if(!group.Genres) {
            group.Genres = {};
            group.Genres.value = "";
        }

        if(!group.Comment) {
            group.Comment = {};
            group.Comment.value = "";
        }

        if(!group.Members) {
            group.Members = {};
            group.Members.value = "";
        }

        if(!group.Former_Members) {
            group.Former_Members = {};
            group.Former_Members.value = "";
        }

        if(!group.HomepageLink) {
            group.HomepageLink = {};
            group.HomepageLink.value = "";
        }

        if(!group.Albums) {
            group.Albums = {};
            group.Albums.value = "";
        }


        return (
            <div className={"page"}>
                <div className="panel">
                    <div className="titlebar">
                        <h1>{group.Name.value}</h1>
                    </div>
                    <div className="topbar">
                        <div>
                            <strong>Description</strong>
                            <p>{group.Comment.value}</p>
                        </div>
                        <img src={this.state.medias.picture} alt={""}/>
                    </div>
                    <div className="main-infos">
                        <div><strong>Albums : </strong> 
                        <br/>
                        {this.affichageAlbum(group)}
                        </div>
                    </div>
                    <div>
                        <strong>Members : </strong>
                        {
                            group.Members.value
                        }
                    </div>
                    <br/>
                    <br/>
                    <div>
                        <strong>Formers members : </strong>
                        {
                            
                        }
                    </div>
                    <br/>
                    <div>
                        <strong> : </strong>
        
                    </div>
                    <br/>
                    <div>
                        <strong>Start Year : </strong>
                        {
                            group.StartYearString.value
                        }
                    </div>
                    <br/>
                    <div>
                        <strong>Quote : </strong>
                        {
                        }
                    </div>
                    <br/>
                    <div>
                        <strong>Homepage(s) : </strong>
                        {
                            this.affichageHomepages(group)
                        }
                    </div>
                </div>
            </div>
        );
    };
}