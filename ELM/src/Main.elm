module Main exposing (main)

import Browser
import Html exposing (Html, text, button, div, input, label, span, ul, li)
import Html.Attributes exposing (style, placeholder, type_, checked)
import Html.Events exposing (onClick, onInput, on)
import Json.Decode exposing (Decoder, string, list, field, map2)
import Http
import Random


-- Define the structure for meanings, including the part of speech and definitions
type alias Meaning =
    { partOfSpeech : String
    , definitions : List String
    }

-- Define the model
type alias Model =
    { words : List String
    , selectedWord : Maybe String
    , meanings : Maybe (List Meaning)
    , loadingWords : Bool
    , userInput : String
    , feedback : String
    , showAnswer : Bool
    , gameStarted : Bool
    , motDevines : List String
    , correctMessage : Bool
    }

-- Initial model
initialModel : Model
initialModel =
    { words = []
    , selectedWord = Nothing
    , meanings = Nothing
    , loadingWords = True
    , userInput = ""
    , feedback = ""
    , showAnswer = False
    , gameStarted = False
    , motDevines = ["", "", "", "", "", "", "", "", "", ""]
    , correctMessage = False
    }

-- Type of messages
type Msg
    = SelectRandomWord (List Int)
    | RequestRandomWord
    | ReceiveDefinition (Result Http.Error (List Meaning))
    | LoadWords
    | ReceiveWords (Result Http.Error String)
    | UpdateUserInput String
    | ToggleShowAnswer Bool
    | StartGame

-- initial command
initLoadWordsCmd : Cmd Msg
initLoadWordsCmd =
    Http.get
        { url = "http://localhost:8000/words.txt"
        , expect = Http.expectString ReceiveWords
        }
        |> Cmd.map (\_ -> LoadWords)
        
-- Function to update model
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        RequestRandomWord ->
            if List.isEmpty model.words then
                (model, Cmd.none)
            else
                let
                    _ = Debug.log "Generating new random word" ()
                in
                (model, Random.generate SelectRandomWord (Random.map List.singleton (Random.int 0 (List.length model.words - 1))))

        SelectRandomWord indices ->
            let
                index = List.head indices |> Maybe.withDefault 0
                selected = List.drop index model.words |> List.head
                _ = Debug.log "Selected index" index
                _ = Debug.log "Selected word" selected
                cmd = Maybe.map requestDefinition selected |> Maybe.withDefault Cmd.none
            in
            ({ model | selectedWord = selected, meanings = Nothing, userInput = "", feedback = "" }, cmd)

        ReceiveDefinition result ->
            case result of
                Ok meanings ->
                    let
                        _ = Debug.log "Received meanings" meanings
                    in
                    ({ model | meanings = Just meanings }, Cmd.none)
                Err error ->
                    let
                        _ = Debug.log "Error loading definitions" error
                    in
                    ({ model | feedback = "Failed to load definitions.", meanings = Nothing }, Cmd.none)

        LoadWords ->
            ({ model | loadingWords = True }, Http.get { url = "http://localhost:8000/words.txt", expect = Http.expectString ReceiveWords })

        ReceiveWords result ->
            case result of
                Ok wordString ->
                    ({ model | words = String.words wordString, loadingWords = False }, Cmd.none)

                Err _ ->
                    ({ model | words = [], loadingWords = False }, Cmd.none)

        UpdateUserInput input ->
            let
                feedback = checkContent input model.selectedWord
            in
            ({ model | userInput = input, feedback = feedback }, Cmd.none)

        ToggleShowAnswer toggle ->
            ({ model | showAnswer = toggle }, Cmd.none)

        StartGame ->
            ({ model | gameStarted = True }, Random.generate SelectRandomWord (Random.map List.singleton (Random.int 0 (List.length model.words - 1))))

-- View function
view : Model -> Html Msg
view model =
    div []
        [ div [ style "font-size" "36px", style "font-weight" "bold" ]
            [ if model.showAnswer && model.gameStarted then
                text <| Maybe.withDefault "Guess it!" model.selectedWord
              else
                text "Guess it!"
            ]
        , if model.gameStarted then
            div []
                [ button [ onClick RequestRandomWord, Html.Attributes.disabled model.loadingWords ] [ text "Get a new word to guess!" ]
                , case model.meanings of
                    Just meanings ->
                        div []
                            [ div [] [ text "Type in to guess" ]
                            , input [ placeholder "", onInput UpdateUserInput ] []
                            , div [ style "color" (colorForMessage model.feedback) ] [ text model.feedback ]
                            , div [] [ text "" ]
                            , label []
                                [ input [ type_ "checkbox", on "change" checkboxDecoder, checked model.showAnswer ] []
                                , span [] [ text "Show the answer" ]
                                ]
                            , div [] [ text "————————————————————————————————————————————————————————————————————————————————" ]
                            , div []
                                [ div [] [ text "Meaning:" ]
                                , div [ style "font-size" "15px" ] (List.concatMap viewMeaning meanings)
                                , div [ style "position" "fixed", style "width" "20%", style "top" "10%", style "left" "70%", style "border-left" "1px solid #ccc", style "padding" "10px" ]
                                    (List.map (\word -> div [] [ text word ]) model.motDevines)
                                , if model.correctMessage then
                                    div [ style "position" "fixed", style "top" "10%", style "left" "40%", style "transform" "translate(-50%, -50%)"
                                        , style "font-size" "40px", style "text-align" "center", style "color" "green" ]
                                        [ text "CORRECT" ]
                                  else
                                    div [] []
                                ]
                            ]
                    Nothing ->
                        text "No definitions available."
                ]
          else
            button [ onClick StartGame ] [ text "Start the Game!" ]
        , if model.loadingWords then
            div [] [ text "Loading..." ]
          else
            div [] []
        ]


viewMeaning : Meaning -> List (Html Msg)
viewMeaning meaning =
    [ div [style "width" "60%", style "float" "left", style "margin-left" "5%" ] [ text (meaning.partOfSpeech) ]
    , ul [] (List.indexedMap viewDefinition meaning.definitions)
    ]

viewDefinition : Int -> String -> Html Msg
viewDefinition index definition =
    div [style "width" "60%", style "float" "left", style "margin-left" "5%" ]
        [ li [] [ text (definition) ] ]

-- JSON decoder for checkbox
checkboxDecoder : Decoder Msg
checkboxDecoder =
    Json.Decode.map ToggleShowAnswer targetChecked

-- Helper decoder to extract the "checked" value from an event target
targetChecked : Decoder Bool
targetChecked =
    Json.Decode.field "target" (Json.Decode.field "checked" Json.Decode.bool)

-- Check if content is correct
checkContent : String -> Maybe String -> String
checkContent content selectedWord =
    case selectedWord of
        Just word ->
            if content == word then
                "Yes"
            else
                if not (String.isEmpty content) && not (String.isEmpty word) && String.left 1 content == String.left 1 word then
                    "First letter is correct"
                else
                    "No"
        Nothing ->
            "No"

-- Color for message
colorForMessage : String -> String
colorForMessage message =
    case message of
        "Yes" -> "green"
        "First letter is correct" -> "blue"
        "No" -> "red"
        _ -> "black"

-- Send HTTP request to get definitiondefinitionDecoder : Decoder Definition
-- Decoder for a single definition
definitionDecoder : Decoder (List Meaning)
definitionDecoder =
    field "0" (field "meanings" (list meaningDecoder))

meaningDecoder : Decoder Meaning
meaningDecoder =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (list (field "definition" string)))

-- HTTP request function for word definitions
requestDefinition : String -> Cmd Msg
requestDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson ReceiveDefinition definitionDecoder
        }

init : () -> (Model, Cmd Msg)
init _ =
    (initialModel, initLoadWordsCmd)
    
-- Main program
main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
