const http = require('http');

http.get('http://localhost:5000/api/users/doctors/public?limit=100', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    const doctor = json.doctors.find(d => d.firstName === 'sahan');
    console.log(JSON.stringify(doctor.doctorDetails.blockedDates, null, 2));
  });
});
