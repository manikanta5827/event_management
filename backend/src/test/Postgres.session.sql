SELECT *
FROM events;
SELECT *
FROM users;
select *
from attendees;
INSERT INTO events (
        name,
        description,
        date_time,
        category,
        cover_image,
        location,
        created_by
    )
VALUES (
        'Environmental Science Conference 2024',
        'A gathering of technology enthusiasts and professionals.',
        '2024-05-16 10:00:00',
        'Environment',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlCibBp_Z0VXLYKRepsVzmiIeu3WhJXyau3Q&s',
        'Australia,Sydney',
        'a0c5a136-f112-4da5-af52-19c17a8750ae'
    );

    
DELETE FROM events;
DROP TABLE events;
ALTER TABLE events
ADD COLUMN location VARCHAR(255);
update events
set location = case
        when name = 'Tech Conference 2025' then 'Singapore'
        when name = 'Music Fest 2025' then 'India,Mumbai'
        when name = 'Startup Pitch Night' then 'USA,New York'
        when name = 'Art Exhibition' then 'India,Delhi'
        when name = 'AI Workshop' then 'UK,London'
    end;