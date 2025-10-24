package com.unimate.support.seed;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.item.support.CompositeItemWriter;
import org.springframework.batch.item.support.IteratorItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
public class SeedBatchConfig {

    private final DataSource dataSource;
    private final RandomDataFactory f = new RandomDataFactory();

    @Bean
    public Job seedJob(JobRepository jobRepository, Step seedStep) {
        return new JobBuilder("seedJob", jobRepository)
                .start(seedStep)
                .build();
    }

    @Bean
    public ItemProcessor<UserProfileItem, UserProfileItem> passwordEncoderProcessor(
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return item -> { item.setPassword(encoder.encode(item.getPassword())); return item; };
    }

    @Bean
    public Step seedStep(
        JobRepository jobRepository,
        PlatformTransactionManager txManager,
        org.springframework.security.crypto.password.PasswordEncoder encoder) {

            ItemProcessor<UserProfileItem, UserProfileItem> proc =
                    item -> { item.setPassword(encoder.encode(item.getPassword())); return item; };

            return new StepBuilder("seedStep", jobRepository)
                    .<UserProfileItem, UserProfileItem>chunk(1000, txManager)
                    .reader(itemReader())
                    .processor(proc)
                    .writer(itemWriter())
                    .build();
    }

    @Bean
    public ItemReader<UserProfileItem> itemReader() {
        List<UserProfileItem> items = new ArrayList<>();
        for (int i = 1; i <= 1000; i++) {
            items.add(new UserProfileItem(
                    f.email(i),
                    "test1234",
                    f.name(),
                    f.gender().name(),
                    f.birthDate(),
                    f.studentVerified(),
                    f.university(),
                    f.sleepTime(),
                    f.bool(),                 // isPetAllowed
                    f.bool(),                 // isSmoker
                    f.range(1,5),             // cleaningFrequency
                    f.range(0,3),             // preferredAgeGap
                    f.range(1,5),             // hygieneLevel
                    f.snoring(),              // isSnoring
                    f.drinkingFrequency(),    // drinkingFrequency
                    f.range(1,5),             // noiseSensitivity
                    f.guestFrequency(),       // guestFrequency
                    f.mbti(),
                    f.startUseDate(),
                    f.endUseDate(),
                    f.matchingEnabled()
            ));
        }
        return new IteratorItemReader<>(items);
    }

    @Bean
    public ItemWriter<UserProfileItem> usersWriter() {
        return new JdbcBatchItemWriterBuilder<UserProfileItem>()
                .dataSource(dataSource)
                .sql("INSERT INTO users (email, password, name, gender, birth_date, student_verified, university) " +
                        "VALUES (:email, :password, :name, :gender, :birthDate, :studentVerified, :university)")
                .beanMapped()
                .build();
    }

    @Bean
    public ItemWriter<UserProfileItem> profilesWriter() {
        return new JdbcBatchItemWriterBuilder<UserProfileItem>()
                .dataSource(dataSource)
                .sql(
                        "INSERT INTO user_profile (" +
                                "  user_id," +
                                "  sleep_time, is_pet_allowed, is_smoker," +
                                "  cleaning_frequency, preferred_age_gap, hygiene_level," +
                                "  is_snoring, drinking_frequency, noise_sensitivity, guest_frequency," +
                                "  matching_enabled, mbti," +
                                "  start_use_date, end_use_date" +
                                ") VALUES (" +
                                "  (SELECT id FROM users WHERE email = :email)," +
                                "  :sleepTime, :isPetAllowed, :isSmoker," +
                                "  :cleaningFrequency, :preferredAgeGap, :hygieneLevel," +
                                "  :isSnoring, :drinkingFrequency, :noiseSensitivity, :guestFrequency," +
                                "  :matchingEnabled, :mbti," +
                                "  :startUseDate, :endUseDate" +
                                ")"
                )
                .beanMapped()
                .build();
    }

    @Bean
    public ItemWriter<UserProfileItem> matchPreferencesWriter() {
        return new JdbcBatchItemWriterBuilder<UserProfileItem>()
                .dataSource(dataSource)
                .sql(
                        "INSERT INTO user_match_preference (" +
                                "  user_id," +
                                "  sleep_time, is_pet_allowed, is_smoker," +
                                "  cleaning_frequency, preferred_age_gap, hygiene_level," +
                                "  is_snoring, drinking_frequency, noise_sensitivity, guest_frequency," +
                                "  start_use_date, end_use_date" +
                                ") VALUES (" +
                                "  (SELECT id FROM users WHERE email = :email)," +
                                "  :sleepTime, :isPetAllowed, :isSmoker," +
                                "  :cleaningFrequency, :preferredAgeGap, :hygieneLevel," +
                                "  :isSnoring, :drinkingFrequency, :noiseSensitivity, :guestFrequency," +
                                "  :startUseDate, :endUseDate" +
                                ")"
                )
                .beanMapped()
                .build();
    }

    @Bean
    public ItemWriter<UserProfileItem> itemWriter() {
        CompositeItemWriter<UserProfileItem> composite = new CompositeItemWriter<>();
        composite.setDelegates(List.of(usersWriter(), profilesWriter(), matchPreferencesWriter())); // 순서 중요: users → profiles → match_preference
        return composite;
    }
}
