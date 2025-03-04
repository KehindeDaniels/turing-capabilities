import PropTypes from 'prop-types';

const Weather = ({ weather }) => {
  // Your component code here
};

Weather.propTypes = {
  weather: PropTypes.shape({
    name: PropTypes.string.isRequired,
    main: PropTypes.shape({
      temp: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired
    }).isRequired,
    weather: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string.isRequired
      })
    ).isRequired,
    wind: PropTypes.shape({
      speed: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

// Add display name
Weather.displayName = 'Weather';

export default Weather;
